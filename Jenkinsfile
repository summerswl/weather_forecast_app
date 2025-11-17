pipeline {

    agent any
    
    stages {

        stage("build") {
            
            steps {
                echo 'Building the application...'
                sh 'docker-compose build '
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm install'
                    } else {
                        bat 'npm install'
                    }
                }
            }
        }

        stage("Test") {

            steps {
                echo 'Testing the application...'
                script {
                    if (isUnix()) {
                            sh 'npm test'
                        } else {
                            bat 'npm test'
                        }
                }
            }        
        }

        stage("Deploy to EC2") {
            steps {
               echo 'deploying the application...'
               withCredentials([sshUserPrivateKey(credentialsId: '503bafd9-dfdf-48bb-bffa-d7e54c2ce0fb', keyFileVariable: 'KEY_FILE')]) {
                    script {
                        def ec2_ip = 'ec2-18-225-3-48.us-east-2.compute.amazonaws.com'
                        def ec2_user = 'ubuntu'
                        
                        sh '''
                            ssh ${ec2_user}@${ec2_ip}
                            mkdir -p /home/ubuntu/rails_react_auth && cd /home/ubuntu/rails_react_auth
                            git clone https://github.com/summerswl/rails_react_auth.git || (cd rails_react_auth)
                            cd rails_react_auth
                            npm install
                            npm run dev                         
                        '''
                    }
               }
            }
        }
    }
            
    post {
        always {
            echo 'Reaching the end of pipeline...'
        }
        success {
            echo 'Build, Test and Deployment completed successfully...'
        }
        failure {
            echo 'The Build, Test or Deployment failed...'
        }
    }
}