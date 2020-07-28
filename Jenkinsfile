pipeline {
	agent any
	environment 
    {
        VERSION = "SAMPLES_${BUILD_NUMBER}"
        PROJECT = 'ccequena'
		IMAGE = "$PROJECT:$VERSION"
        ECRURL = 'https://708988062417.dkr.ecr.ap-southeast-2.amazonaws.com/ccequena'
		CRURL = '708988062417.dkr.ecr.ap-southeast-2.amazonaws.com/ccequena'
        ECRCRED = 'ecr:ap-southeast-2:ccequena'
		CLUSTERNAME= 'fargate'
		SERVICE_NAME = "${NAME}-service"
		TASKDEFILE  = "file://aws/task-definition-${IMAGE}.json"
		TASKFAMILY = "Run-Task"
		SERVICENAME = 'DEMO'

		
		
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

				
		stage("Deploy") {
        // Replace BUILD_TAG placeholder in the task-definition file -
        // with the remoteImageTag (imageTag-BUILD_NUMBER)
		steps {
                script {
        sh  "                                                                     \
          sed -e  's;%BUILD_TAG%;$IMAGE;g'                             \
                  aws/task-definition.json >                                      \
                  aws/task-definition-${IMAGE}.json                      \
        "
		

        // Get current [TaskDefinition#revision-number]
        def currTaskDef = sh (
          returnStdout: true,
          script:  "                                                              \
            aws ecs describe-task-definition  --task-definition ${TASKFAMILY}     \
                                              | egrep 'revision'                  \
                                              | tr ',' ' '                        \
                                              | awk '{print \$2}'                 \
          "
        ).trim()

        def currentTask = sh (
          returnStdout: true,
          script:  "                                                              \
            aws ecs list-tasks  --cluster ${CLUSTERNAME}                          \
                                --family ${TASKFAMILY}                            \
                                --output text                                     \
                                | egrep 'TASKARNS'                                \
                                | awk '{print \$2}'                               \
          "
        ).trim()

        /*
        / Scale down the service
        /   Note: specifiying desired-count of a task-definition in a service -
        /   should be fine for scaling down the service, and starting a new task,
        /   but due to the limited resources (Only one VM instance) is running
        /   there will be a problem where one container is already running/VM,
        /   and using a port(80/443), then when trying to update the service -
        /   with a new task, it will complaine as the port is already being used,
        /   as long as scaling down the service/starting new task run simulatenously
        /   and it is very likely that starting task will run before the scaling down service finish
        /   so.. we need to manually stop the task via aws ecs stop-task.
        */
        if(currTaskDef) {
          sh  "                                                                   \
            aws ecs update-service  --cluster ${CLUSTERNAME}                      \
                                    --service ${SERVICENAME}                      \
                                    --task-definition ${TASKFAMILY}:${currTaskDef}\
                                    --desired-count 0                             \
          "
        }
        if (currentTask) {
          sh "aws ecs stop-task --cluster ${CLUSTERNAME} --task ${currentTask}"
        }

        // Register the new [TaskDefinition]
        sh  "                                                                     \
          aws ecs register-task-definition  --family ${TASKFAMILY}                \
                                            --cli-input-json ${TASKDEFILE}        \
        "

        // Get the last registered [TaskDefinition#revision]
        def taskRevision = sh (
          returnStdout: true,
          script:  "                                                              \
            aws ecs describe-task-definition  --task-definition ${TASKFAMILY}     \
                                              | egrep 'revision'                  \
                                              | tr ',' ' '                        \
                                              | awk '{print \$2}'                 \
          "
        ).trim()

        // ECS update service to use the newly registered [TaskDefinition#revision]
        //
        sh  "                                                                     \
          aws ecs update-service  --cluster ${CLUSTERNAME}                        \
                                  --service ${SERVICENAME}                        \
                                  --task-definition ${TASKFAMILY}:${taskRevision} \
                                  --desired-count 1                               \
        "
				}
		}
      }
	}

		post {
        	always {
            // make sure that the Docker image is removed
            sh "docker rmi $IMAGE | true"
			sh "docker rmi $CRURL:$VERSION | true"
        	}
    	}
		
	
}
