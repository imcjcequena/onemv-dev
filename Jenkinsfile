pipeline {
	agent any
	environment 
    {
        VERSION = "SAMPLES_${BUILD_NUMBER}"
        PROJECT = 'ccequena'
		IMAGE = "$PROJECT:$VERSION"
        ECRURL = 'https://708988062417.dkr.ecr.ap-southeast-2.amazonaws.com/ccequena'
        ECRCRED = 'ecr:ap-southeast-2:ccequena'
		CLUSTER= 'fargate'
		FAMILY= '`sed -n 's/.*"family": "\(.*\)",/\1/p' taskdef.json`'
		NAME= '`sed -n 's/.*"name": "\(.*\)",/\1/p' taskdef.json`'
		SERVICE_NAME= "${NAME}-service"
		PATH= "$PATH:/usr/local/bin; export PATH"
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

		stage('Deploy') {
			steps {
				script {
					sh 'sed -e "s;%BUILD_NUMBER%;S{BUILD_NUMBER}:g" -e
					   "s;%REPOSITORY_URI%:S{ECRURL};g" taskdef.json > S{NAME}-
						SAMPLES_${BUILD_NUMBER}.json'
					sh 'aws ecs register-task-definition --family ${FAMILY} --cli-input-json file://${WORKSPACE}${NAME}-
						SAMPLES_${BUILD_NUMBER}.json --region ${REGION}'
					SERVICES = sh(script: `aws ecs describe-services --services ${SERVICE_NAME} --cluster {CLUSTER} --region
							  ${REGION} | jq.failures[]`, returnStdout: true).trim()
					REVISION= sh(script: `aws ecs describe-task-definition --task-definition ${NAME} --region ${REGION}
							 | jq.taskDefinition.revision`, returnStdout: true).trim()

					if["$SERVICES" == ""]; then
						echo “entered existing service"
						DESIRED_COUNT = sh(script: `aws ecs describe-services --services ${SERVICE_NAME} --cluster
						${CLUSTER} --region ${REGION}] jq.services[].desiredCount` , returnStdout: true).trim()
					if[ ${DESIRED_COUNT} = "0"]; then
						DESIRED_COUNT= "1"
					
					fi
						sh 'aws ecs update-service --cluster ${CLUSTER} --region ${REGION} --service ${SERVICE_NAME} 
						--task-definition ${FAMILY}${REVISION} --desired-count ${DESIRED_COUNT}'
					else
						sh 'aws ecs create-service --service-name ${SERVICE_NAME} --launch-type FARGATE --desired-count
						1 --task-definition ${FAMILY} --cluster ${CLUSTER} --region ${REGION}'
					fi
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
