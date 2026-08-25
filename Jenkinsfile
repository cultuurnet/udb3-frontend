pipeline {
    agent none

    options {
        disableRestartFromStage()
    }

    environment {
        PIPELINE_VERSION = util.pipelineVersion()
        SOURCE_URL       = 'https://github.com/cultuurnet/udb3-frontend'
        REPOSITORY_NAME  = 'uitdatabank-frontend'
        ECR_REGISTRY     = '757200591793.dkr.ecr.eu-west-1.amazonaws.com'
        ECR_REPOSITORY   = 'uitdatabank/frontend'
    }

    stages {
        stage('Pre build') {
            steps {
                setBuildDisplayName to: env.PIPELINE_VERSION
                sendBuildNotification()
            }
        }

        stage('Build') {
            parallel {
                stage('Build deb package') {
                    agent { label 'docker' }
                    stages {
                        stage('Build project') {
                            agent {
                                docker {
                                    image 'base_images/node:22'
                                    reuseNode true
                                }
                            }
                            environment {
                                YARN_CACHE_FOLDER = '/tmp/.yarn-cache'
                            }
                            steps {
                                sh label: 'Install node modules', script: 'yarn install --frozen-lockfile'
                                sh label: 'Build project', script: 'yarn build'
                                sh label: 'Remove node modules', script: 'rm -rf node_modules'
                                sh label: 'Install production node modules', script: 'yarn install --frozen-lockfile --production'
                            }
                        }

                        stage('Build artifact') {
                            agent {
                                docker {
                                    image 'base_images/ruby:2.7'
                                    reuseNode true
                                }
                            }
                            environment {
                                GIT_SHORT_COMMIT = util.shortCommitRef()
                                ARTIFACT_VERSION = "${env.PIPELINE_VERSION}" + '+sha.' + "${env.GIT_SHORT_COMMIT}"
                            }
                            steps {
                                sh label: 'Install rubygems', script: 'bundle install --deployment'
                                sh label: 'Build artifact', script: "bundle exec rake build_artifact ARTIFACT_VERSION=${env.ARTIFACT_VERSION}"
                                archiveArtifacts artifacts: "pkg/*${env.ARTIFACT_VERSION}*.deb", onlyIfSuccessful: true
                            }
                        }
                    }
                    post {
                        cleanup {
                            cleanWs()
                        }
                    }
                }

                stage('Build & push docker image') {
                    agent { label 'docker_build' }
                    environment {
                        GIT_SHORT_COMMIT = util.shortCommitRef()
                        IMAGE_URI        = "${env.ECR_REGISTRY}/${env.ECR_REPOSITORY}:${env.PIPELINE_VERSION}"
                    }
                    steps {
                        sh label: 'Build image', script: """
                            docker build \\
                                --tag ${env.IMAGE_URI} \\
                                --tag ${env.ECR_REGISTRY}/${env.ECR_REPOSITORY}:latest \\
                                --label org.opencontainers.image.revision=${env.GIT_SHORT_COMMIT} \\
                                --label org.opencontainers.image.version=${env.PIPELINE_VERSION} \\
                                --label org.opencontainers.image.source=${env.SOURCE_URL} \\
                                --label be.publiq.jenkins.run-url=${env.RUN_DISPLAY_URL} \\
                                .
                        """

                        sh label: 'Push image', script: "docker push ${env.IMAGE_URI}"
                        sh label: 'Push image', script: "docker push ${env.ECR_REGISTRY}/${env.ECR_REPOSITORY}:latest"

                        echo "Pushed: ${env.IMAGE_URI}"
                    }
                    post {
                        cleanup {
                            catchError(
                                buildResult: 'SUCCESS',
                                stageResult: 'UNSTABLE',
                                message: 'Cleanup failed'
                            ) {
                                sh "docker rmi ${env.IMAGE_URI}"
                                sh "docker rmi ${env.ECR_REGISTRY}/${env.ECR_REPOSITORY}:latest"
                                cleanWs()
                            }
                        }
                    }
                }
            }
        }

        stage('Upload artifact') {
            agent any
            options { skipDefaultCheckout() }
            steps {
                copyArtifacts filter: 'pkg/*.deb', projectName: env.JOB_NAME, flatten: true, selector: specific(env.BUILD_NUMBER)
                uploadAptlyArtifacts artifacts: '*.deb', repository: env.REPOSITORY_NAME
                createAptlySnapshot name: "${env.REPOSITORY_NAME}-${env.PIPELINE_VERSION}", repository: env.REPOSITORY_NAME
            }
            post {
                cleanup {
                    cleanWs()
                }
            }
        }

        stage('Deploy to development') {
            agent any
            options { skipDefaultCheckout() }
            environment {
                APPLICATION_ENVIRONMENT = 'development'
            }
            steps {
                publishAptlySnapshot snapshotName: "${env.REPOSITORY_NAME}-${env.PIPELINE_VERSION}", publishTarget: "${env.REPOSITORY_NAME}-${env.APPLICATION_ENVIRONMENT}", distributions: ['focal', 'noble']
            }
        }

        stage('Deploy to acceptance') {
            agent any
            options { skipDefaultCheckout() }
            environment {
                APPLICATION_ENVIRONMENT = 'acceptance'
            }
            stages {
                stage('Publish snapshot / promote docker image') {
                    parallel {
                        stage('Publish snapshot') {
                            steps {
                                publishAptlySnapshot snapshotName: "${env.REPOSITORY_NAME}-${env.PIPELINE_VERSION}", publishTarget: "${env.REPOSITORY_NAME}-${env.APPLICATION_ENVIRONMENT}", distributions: ['focal', 'noble']
                            }
                        }
                        stage('Promote docker image') {
                            steps {
                                promoteDockerImage repository: env.ECR_REPOSITORY, sourceTag: env.PIPELINE_VERSION, targetTag: env.APPLICATION_ENVIRONMENT
                            }
                        }
                    }
                }
                stage('Deploy') {
                    parallel {
                        stage('Deploy to web node') {
                            steps {
                                triggerDeployment nodeName: 'uitdatabank-web-acc02', timeout: 600
                            }
                        }
                        stage('Deploy to frontend node (docker)') {
                            steps {
                                triggerDeployment nodeName: 'uitdatabank-frontend-docker-acc01', timeout: 600
                            }
                        }
                    }
                }
            }
            post {
                always {
                    sendBuildNotification to: '#upw-ops', message: "Pipeline <${env.RUN_DISPLAY_URL}|${util.getJobDisplayName()} [${currentBuild.displayName}]>: deployed to *${env.APPLICATION_ENVIRONMENT}*"
                }
            }
        }

        stage('Deploy to testing') {
            input { message "Deploy to Testing?" }
            agent any
            options { skipDefaultCheckout() }
            environment {
                APPLICATION_ENVIRONMENT = 'testing'
            }
            stages {
                stage('Publish snapshot / promote docker image') {
                    parallel {
                        stage('Publish snapshot') {
                            steps {
                                publishAptlySnapshot snapshotName: "${env.REPOSITORY_NAME}-${env.PIPELINE_VERSION}", publishTarget: "${env.REPOSITORY_NAME}-${env.APPLICATION_ENVIRONMENT}", distributions: ['focal', 'noble']
                            }
                        }
                        stage('Promote docker image') {
                            steps {
                                promoteDockerImage repository: env.ECR_REPOSITORY, sourceTag: env.PIPELINE_VERSION, targetTag: env.APPLICATION_ENVIRONMENT
                            }
                        }
                    }
                }
                stage('Deploy') {
                    parallel {
                        stage('Deploy to web node') {
                            steps {
                                triggerDeployment nodeName: 'uitdatabank-web-test02', timeout: 600
                            }
                        }
                        stage('Deploy to frontend node (docker)') {
                            steps {
                                triggerDeployment nodeName: 'uitdatabank-frontend-docker-test01', timeout: 600
                            }
                        }
                    }
                }
            }
            post {
                always {
                    sendBuildNotification to: '#upw-ops', message: "Pipeline <${env.RUN_DISPLAY_URL}|${util.getJobDisplayName()} [${currentBuild.displayName}]>: deployed to *${env.APPLICATION_ENVIRONMENT}*"
                }
            }
        }

        stage('Deploy to production') {
            input { message "Deploy to Production?" }
            agent any
            options { skipDefaultCheckout() }
            environment {
                APPLICATION_ENVIRONMENT = 'production'
            }
            steps {
                publishAptlySnapshot snapshotName: "${env.REPOSITORY_NAME}-${env.PIPELINE_VERSION}", publishTarget: "${env.REPOSITORY_NAME}-${env.APPLICATION_ENVIRONMENT}", distributions: ['focal', 'noble']
                triggerDeployment nodeName: 'uitdatabank-web-prod02', timeout: 600
            }
            post {
                always {
                    sendBuildNotification to: '#upw-ops', message: "Pipeline <${env.RUN_DISPLAY_URL}|${util.getJobDisplayName()} [${currentBuild.displayName}]>: deployed to *${env.APPLICATION_ENVIRONMENT}*"
                }
                cleanup {
                    cleanupAptlySnapshots repository: env.REPOSITORY_NAME
                }
            }
        }

        stage('Tag release') {
            agent any
            options { skipDefaultCheckout() }
            steps {
                copyArtifacts filter: 'pkg/*.deb', projectName: env.JOB_NAME, flatten: true, selector: specific(env.BUILD_NUMBER)
                tagRelease commitHash: artifact.metadata(artifactFilter: '*.deb', field: 'git-ref')
            }
            post {
                cleanup {
                    cleanWs()
                }
            }
        }
    }

    post {
        always {
            sendBuildNotification()
        }
    }
}
