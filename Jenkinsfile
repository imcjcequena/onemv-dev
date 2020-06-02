pipeline {
	agent any
	stages {
		stage("ConfigFile Plugin") {
			steps {
				configFileProvider([configFile(fileId: 'd77673ec-5452-4e66-9312-29bd66727fd3', targetLocation: '.env.example')]) 
				echo ' executing configfiles...'
				
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
	}
}
