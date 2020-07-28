pipeline {
	agent any
	environment 
    {
        VERSION = "SAMPLES_${BUILD_NUMBER}"
        PROJECT = 'ccequena'
		IMAGE = "$PROJECT:$VERSION"
        ECRURL = 'https://708988062417.dkr.ecr.ap-southeast-2.amazonaws.com/ccequena'
        ECRCRED = 'ecr:ap-southeast-2:ccequena'
		
	}
	stages {
		stage("ConfigFile Plugin") {
			steps {
				configFileProvider([configFile(fileId: 'd77673ec-5452-4e66-9312-29bd66727fd3', targetLocation: '.env.example')]) { 
				echo ' executing configfiles...'
				sh 'cat .env.example'
				}
				
			}
		}
		stage("NPM Build") {
			steps {
				echo 'executing npm build..'
				nodejs('nodejs') {
					sh 'npm install yarn -g'
					sh 'yarn'
					sh 'mv .env.example .env'
					sh 'npm test'
				}
			}
		}
		stage("Extract test results") {
			steps {
    			cobertura coberturaReportFile: 'coverage/cobertura-coverage.xml'
			}
		}
		stage('Publish test results') {
			steps {
      			junit 'test-results.xml'
			}
 		 }
		
		stage('Docker build') {
            steps {
                script {
                    // Build the docker image using a Dockerfile
                    docker.build("$IMAGE")
                }
            }
        }
		stage('Docker push') {
            steps {
                script {
                    // login to ECR - for now it seems that that the ECR Jenkins plugin is not performing the login as expected. I hope it will in the future.
                    
                    // Push the Docker image to ECR
                    docker.withRegistry(ECRURL, ECRCRED)
                    {
                        docker.image("$IMAGE").push()
                    }
                }
            }
        }
	}
		post {
        	always {
            // make sure that the Docker image is removed
            sh "docker rmi $IMAGE | true"
        	}
    	}
		
	
}
