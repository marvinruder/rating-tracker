node {
    withEnv([
        'imagename=marvinruder/rating-tracker',
        'main_tag=latest',
        'branch_tag=SNAPSHOT',
        'FORCE_COLOR=true'
    ]) {

        def GIT_COMMIT_HASH
        def image

        stage('Clone repository') {
            checkout scm
            GIT_COMMIT_HASH = sh (script: "git log -n 1 --pretty=format:'%H'", returnStdout: true)
            sh "cat .yarnrc-ci-add.yml >> .yarnrc.yml"
        }

        stage ('Install dependencies') {
            docker.build("$imagename:build-$GIT_COMMIT_HASH-yarn", "-f Dockerfile-yarn .")
            sh """
            id=\$(docker create $imagename:build-$GIT_COMMIT_HASH-yarn)
            docker cp \$id:/workdir/.yarn/. ./.yarn
            docker cp \$id:/workdir/global .
            docker cp \$id:/workdir/.pnp.cjs .
            docker rm -v \$id
            """
        }

        parallel(

            test: {
                stage ('Run Tests') {
                    docker.build("$imagename:build-$GIT_COMMIT_HASH-test", "-f Dockerfile-test .")
                }
            },

            build: {
                stage ('Build Docker Image') {
                    image = docker.build("$imagename:build-$GIT_COMMIT_HASH")
                }
            }

        )

        parallel(

            codacy: {
                stage ('Publish coverage results to Codacy') {
                    sh """
                    id=\$(docker create $imagename:build-$GIT_COMMIT_HASH-test)
                    mkdir -p coverage/{backend,commons,frontend}
                    docker cp \$id:/workdir/packages/rating-tracker-backend/coverage/. ./coverage/backend
                    docker cp \$id:/workdir/packages/rating-tracker-commons/coverage/. ./coverage/commons
                    docker cp \$id:/workdir/packages/rating-tracker-frontend/coverage/. ./coverage/frontend
                    docker rm -v \$id
                    """
                    withCredentials([string(credentialsId: 'codacy-project-token-rating-tracker', variable: 'CODACY_PROJECT_TOKEN')]) {
                        sh """#!/usr/bin/env bash
                        bash <(curl -Ls https://coverage.codacy.com/get.sh) report $(find . -name 'clover.xml' -printf '-r %p ')
                        """
                    }
                }
            },

            dockerhub: {
                stage ('Publish Docker Image') {
                    docker.withRegistry('', 'dockerhub') {
                        if (env.BRANCH_NAME == 'main') {
                            image.push(main_tag)
                        } else if (!(env.BRANCH_NAME).startsWith('renovate')) {
                            image.push(branch_tag)
                        }
                    }
                }
            }
        )

        stage ('Cleanup') {
            sh """
            docker rmi $imagename:build-$GIT_COMMIT_HASH-yarn || true
            docker rmi $imagename:build-$GIT_COMMIT_HASH-test || true
            docker rmi $imagename:build-$GIT_COMMIT_HASH || true
            docker image prune --filter label=stage=build -f
            docker builder prune -f
            """
        }
    }
}
