#!/bin/bash
set -e
exec > >(tee /var/log/user-data.log) 2>&1

echo "=== FINAL SCRIPT – DOCKER COMPOSE V2 PLUGIN INSTALLED – $(date) ==="

export DEBIAN_FRONTEND=noninteractive

apt-get update -y
apt-get upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"

# Install Docker prerequisites
apt-get install -y ca-certificates curl gnupg lsb-release

# Add official Docker APT repository (includes Compose v2 plugin)
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y

# Install Docker + Compose v2 plugin
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl start docker
systemctl enable docker
usermod -aG docker ubuntu

# Core build dependencies
apt-get install -y wget git gcc g++ make build-essential libssl-dev pkg-config \
    zlib1g-dev libreadline-dev libncurses5-dev libffi-dev libgdbm-dev libyaml-dev

# AWS CLI
snap install aws-cli --classic

# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
echo "Node $(node --version) – npm $(npm --version)"

# GitHub token
REGION="us-east-2"
AWS_CMD=$(command -v aws || echo "/snap/bin/aws")
GITHUB_TOKEN=$($AWS_CMD secretsmanager get-secret-value \
    --secret-id github-pat-token --region "$REGION" --query SecretString --output text)

if [ -z "$GITHUB_TOKEN" ]; then echo "ERROR: Token missing!"; exit 1; fi

# Clone repository
cd /home/ubuntu
sudo -u ubuntu git clone "https://$GITHUB_TOKEN@github.com/summerswl/weather_forecast_app.git"
chown -R ubuntu:ubuntu /home/ubuntu/weather_forecast_app
cd /home/ubuntu/weather_forecast_app

# npm install
echo "Running npm install..."
sudo -u ubuntu npm install

# Ruby 3.2.8 installation
echo "Installing Ruby 3.2.8..."
sudo -u ubuntu bash << 'RUBY'
set -e
mkdir -p ~/ruby-build-temp ~/ruby-build-cache
export TMPDIR=~/ruby-build-temp
export XDG_CACHE_HOME=~/ruby-build-cache

git clone https://github.com/rbenv/rbenv.git ~/.rbenv 2>/dev/null || true
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"

git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build 2>/dev/null || true

export RUBY_CONFIGURE_OPTS="--with-openssl-dir=/usr --disable-install-doc"
export MAKE_OPTS="-j4"

rbenv install 3.2.8 -f -v
rbenv global 3.2.8
export PATH="$HOME/.rbenv/shims:$PATH"
rbenv rehash
gem install bundler --no-document

echo "Ruby $(ruby --version)"
echo "Bundler $(bundle --version)"
RUBY

# Bundle install (production gems only – correct for production)
echo "Installing production gems (Rails 7 included)..."
sudo -u ubuntu bash -c 'export PATH="$HOME/.rbenv/shims:$PATH" && bundle install --without development test'

# Docker Compose up (v2 plugin – with -d for detached)
echo "Starting your weather forecast app (detached mode)..."
sudo -u ubuntu bash -c 'export PATH="$HOME/.rbenv/shims:$PATH:/usr/bin" && docker compose up --build -d'

PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "localhost")
echo "=== DEPLOYMENT COMPLETE! App is live at http://$PUBLIC_IP ==="
echo "Verify: docker compose ps"
echo "Log: tail -f /var/log/user-data.log"