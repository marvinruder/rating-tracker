node {
    withEnv([
        'imagename=marvinruder/rating-tracker',
        'main_tag=latest',
        'branch_tag=SNAPSHOT',
        'FORCE_COLOR=true'
    ]) {

        def GIT_COMMIT_HASH
        def image
        def PGPORT
        def REDISPORT

        stage('Clone repository') {
            checkout scm
            GIT_COMMIT_HASH = sh (script: "git log -n 1 --pretty=format:'%H' | head -c 8", returnStdout: true)
            PGPORT = sh (script: "seq 49152 65535 | shuf | head -c 5", returnStdout: true)
            REDISPORT = sh (script: "seq 49152 65535 | shuf | head -c 5", returnStdout: true)
            sh "cat .yarnrc-ci-add.yml >> .yarnrc.yml"
            sh "sed -i \"s/127.0.0.1/172.17.0.1/ ; s/54321/$PGPORT/ ; s/63791/$REDISPORT/\" packages/backend/test/.env"
        }

        parallel(
            testenv: {
                stage('Start test environment') {
                    sh """
                    PGPORT=$PGPORT REDISPORT=$REDISPORT docker compose -p rating-tracker-test-$GIT_COMMIT_HASH -f packages/backend/test/docker-compose.yml up --force-recreate -V -d
                    """
                }
            },

            dep: {
                stage ('Install dependencies') {
                    sh "mkdir -p /home/jenkins/.cache/yarn/global && cp -arn /home/jenkins/.cache/yarn/global ."
                    docker.build("$imagename:build-$GIT_COMMIT_HASH-yarn", "-f Dockerfile-yarn .")
                    sh """
                    id=\$(docker create $imagename:build-$GIT_COMMIT_HASH-yarn)
                    docker cp \$id:/workdir/.yarn/. ./.yarn
                    docker cp \$id:/workdir/global .
                    docker cp \$id:/workdir/.pnp.cjs .
                    docker cp \$id:/workdir/packages/backend/prisma/client/. ./packages/backend/prisma/client
                    docker rm -v \$id
                    """
                    sh "cp -arn ./global /home/jenkins/.cache/yarn"
                }
            }
        )

        parallel(

            test: {
                stage ('Run Tests') {
                    docker.build("$imagename:build-$GIT_COMMIT_HASH-test", "-f Dockerfile-test .")
                }
            },

            build: {
                stage ('Build Docker Image') {
                    image = docker.build("$imagename:build-$GIT_COMMIT_HASH", "--build-arg BUILD_DATE=\$(date -u +'%Y-%m-%dT%H:%M:%SZ') .")
                }
            }

        )

        parallel(

            codacy: {
                stage ('Publish coverage results to Codacy') {
                    sh """
                    id=\$(docker create $imagename:build-$GIT_COMMIT_HASH-test)
                    mkdir -p coverage/{backend,commons,frontend}
                    docker cp \$id:/workdir/packages/backend/coverage/. ./coverage/backend
                    docker cp \$id:/workdir/packages/commons/coverage/. ./coverage/commons
                    docker cp \$id:/workdir/packages/frontend/coverage/. ./coverage/frontend
                    docker rm -v \$id
                    """
                    lock('codacy-coverage-reporter') {
                        withCredentials([string(credentialsId: 'codacy-project-token-rating-tracker', variable: 'CODACY_PROJECT_TOKEN')]) {
                            sh """#!/usr/bin/env bash
                            bash <(curl -Ls https://coverage.codacy.com/get.sh) report \$(find . -name 'clover.xml' -printf '-r %p ') --commit-uuid \$(git log -n 1 --pretty=format:'%H')
                            """
                        }
                    }
                }
            },

            dockerhub: {
                stage ('Publish Docker Image') {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        if (env.BRANCH_NAME == 'main') {
                            sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                            image.push(main_tag)
                            sh 'docker logout'
                            sh "mkdir -p /home/jenkins/.cache/README && cat README.md | sed 's|^<!-- <div id|<div id|g;s|</div> -->$|</div>|g;s|\"/packages/frontend/public/assets|\"https://raw.githubusercontent.com/marvinruder/rating-tracker/main/packages/frontend/public/assets|g' > /home/jenkins/.cache/README/$GIT_COMMIT_HASH"
                            sh "docker run --rm -t -v /tmp:/tmp -e DOCKER_USER -e DOCKER_PASS chko/docker-pushrm --file /tmp/jenkins-cache/README/$GIT_COMMIT_HASH $imagename"
                        } else if (!(env.BRANCH_NAME).startsWith('renovate')) {
                            sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                            image.push(branch_tag)
                            sh 'docker logout'
                        }
                    }
                }
            }
        )

        stage ('Cleanup') {
            sh """
            docker compose -p rating-tracker-test-$GIT_COMMIT_HASH -f packages/backend/test/docker-compose.yml down -t 0
            docker rmi $imagename:build-$GIT_COMMIT_HASH-yarn || true
            docker rmi $imagename:build-$GIT_COMMIT_HASH-test || true
            docker rmi $imagename:build-$GIT_COMMIT_HASH || true
            docker image prune --filter label=stage=build -f
            docker builder prune -f --keep-storage 4G
            rm -r global
            """
        }
    }
}
