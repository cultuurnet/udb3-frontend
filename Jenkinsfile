pipeline {
    agent none

    options {
        disableRestartFromStage()
    }

    environment {
        PIPELINE_VERSION = util.pipelineVersion()
        REPOSITORY_NAME  = 'uitdatabank-frontend'
    }

    stages {
        stage('Pre build') {
            steps {
                setBuildDisplayName to: env.PIPELINE_VERSION
                sendBuildNotification()
            }
        }

        stage('Setup and build') {
            stages {
                stage('Build project') {
                    agent {
                        docker {
                            image 'base_images/node:22'
                            label 'docker'
                        }
                    }
                    environment {
                        YARN_CACHE_FOLDER = '/tmp/.yarn-cache'
                    }
                    steps {
                        sh label: 'Install node modules', script: 'yarn install --frozen-lockfile'
                        script {
                            // Pins the acceptance tests' Playwright image to the version in the lockfile
                            env.PLAYWRIGHT_VERSION = sh(label: 'Read Playwright version', returnStdout: true, script: "node -p \"require('@playwright/test/package.json').version\"").trim()
                        }
                        sh label: 'Build project', script: 'yarn build'
                        sh label: 'Remove node modules', script: 'rm -rf node_modules'
                        sh label: 'Install production node modules', script: 'yarn install --frozen-lockfile --production'
                        stash name: 'build', includes: '.next/**, node_modules/**'
                    }
                    post {
                        cleanup {
                            cleanWs()
                        }
                    }
                }

                stage('Build artifact') {
                    agent {
                        docker {
                            image 'base_images/ruby:2.7'
                            label 'docker'
                        }
                    }
                    environment {
                        GIT_SHORT_COMMIT = util.shortCommitRef()
                        ARTIFACT_VERSION = "${env.PIPELINE_VERSION}" + '+sha.' + "${env.GIT_SHORT_COMMIT}"
                    }
                    steps {
                        sh label: 'Install rubygems', script: 'bundle install --deployment'
                        unstash 'build'
                        sh label: 'Build artifact', script: "bundle exec rake build_artifact ARTIFACT_VERSION=${env.ARTIFACT_VERSION}"
                        archiveArtifacts artifacts: "pkg/*${env.ARTIFACT_VERSION}*.deb", onlyIfSuccessful: true
                    }
                    post {
                        cleanup {
                            cleanWs()
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
            agent {
                docker {
                    image 'base_images/ruby:2.7'
                    label 'docker'
                }
            }
            options { skipDefaultCheckout() }
            environment {
                APPLICATION_ENVIRONMENT = 'acceptance'
            }
            steps {
                publishAptlySnapshot snapshotName: "${env.REPOSITORY_NAME}-${env.PIPELINE_VERSION}", publishTarget: "${env.REPOSITORY_NAME}-${env.APPLICATION_ENVIRONMENT}", distributions: ['focal', 'noble']
                triggerDeployment nodeName: 'uitdatabank-web-acc02', timeout: 600
            }
            post {
                always {
                    sendBuildNotification to: '#upw-ops', message: "Pipeline <${env.RUN_DISPLAY_URL}|${util.getJobDisplayName()} [${currentBuild.displayName}]>: deployed to *${env.APPLICATION_ENVIRONMENT}*"
                }
            }
        }

        stage('Run acceptance tests') {
            agent {
                docker {
                    image "playwright:v${env.PLAYWRIGHT_VERSION}-noble"
                    registryUrl 'https://mcr.microsoft.com'
                    label 'container'
                    args  '-e HOME=/tmp'
                }
            }
            environment {
                E2E_TEST_BASE_URL                     = 'https://acc.uitdatabank.be'
                TZ                                    = 'Europe/Brussels'
                LANG                                  = 'nl_BE.UTF-8'
                NEXT_PUBLIC_UIV_URL                   = 'https://acc.uitinvlaanderen.be'
                NEXT_PUBLIC_CK_URL                    = 'https://test.cultuurkuur.be'
                NEXT_PUBLIC_UDB_PUBLICATION_RULES_URL = 'https://helpdesk.publiq.be/hc/nl/articles/360008702459-Welke-activiteiten-mag-ik-invoeren-in-UiTdatabank'
                NEXT_PUBLIC_FF_BOA                    = 'true'
                YARN_CACHE_FOLDER                     = '/tmp/.yarn-cache'
                PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD      = '1'
            }
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    timeout(time: 45, unit: 'MINUTES') {
                        sh label: 'Install node modules', script: 'npx --yes yarn@1 install --frozen-lockfile'
                        withCredentials([usernamePassword(credentialsId: 'uitdatabank-frontend_e2etest_user',
                                                          usernameVariable: 'E2E_TEST_EMAIL',
                                                          passwordVariable: 'E2E_TEST_PASSWORD'),
                                         usernamePassword(credentialsId: 'uitdatabank-frontend_e2etest_admin',
                                                          usernameVariable: 'E2E_TEST_ADMIN_EMAIL',
                                                          passwordVariable: 'E2E_TEST_ADMIN_PASSWORD'),
                                         string(credentialsId: 'uitdatabank-frontend_e2etest_admin_id',
                                                variable: 'E2E_TEST_ADMIN_ID')]
                        ) {
                            sh label: 'Run acceptance tests', script: 'npx playwright test'
                        }
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'playwright-report/**/*, test-results/**/*', allowEmptyArchive: true
                    sendBuildNotification to: '#upw-ops', message: "Pipeline <${env.RUN_DISPLAY_URL}|${util.getJobDisplayName()} [${currentBuild.displayName}]>: automated acceptance tests finished"
                }
                cleanup {
                    cleanWs()
                }
            }
        }

        stage('Deploy to testing') {
            input { message "Deploy to Testing?" }
            agent {
                docker {
                    image 'base_images/ruby:2.7'
                    label 'docker'
                }
            }
            options { skipDefaultCheckout() }
            environment {
                APPLICATION_ENVIRONMENT = 'testing'
            }
            steps {
                publishAptlySnapshot snapshotName: "${env.REPOSITORY_NAME}-${env.PIPELINE_VERSION}", publishTarget: "${env.REPOSITORY_NAME}-${env.APPLICATION_ENVIRONMENT}", distributions: ['focal', 'noble']
                triggerDeployment nodeName: 'uitdatabank-web-test02', timeout: 600
            }
            post {
                always {
                    sendBuildNotification to: '#upw-ops', message: "Pipeline <${env.RUN_DISPLAY_URL}|${util.getJobDisplayName()} [${currentBuild.displayName}]>: deployed to *${env.APPLICATION_ENVIRONMENT}*"
                }
            }
        }

        stage('Deploy to production') {
            input { message "Deploy to Production?" }
            agent {
                docker {
                    image 'base_images/ruby:2.7'
                    label 'docker'
                }
            }
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
