node('rating-tracker-build') {
    withEnv([
        'imagename=marvinruder/rating-tracker',
        'FORCE_COLOR=true'
    ]) {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {

            def GIT_COMMIT_HASH
            def image
            def PGPORT
            def REDISPORT

            try {

                stage('Clone repository') {
                    checkout scm
                    GIT_COMMIT_HASH = sh (script: "git log -n 1 --pretty=format:'%H' | head -c 8", returnStdout: true)
                    PGPORT = sh (script: "seq 49152 65535 | shuf | head -c 5", returnStdout: true)
                    REDISPORT = sh (script: "seq 49152 65535 | shuf | head -c 5", returnStdout: true)
                    sh """
                    echo \"globalFolder: /workdir/global\" >> .yarnrc.yml
                    echo \"preferAggregateCacheInfo: true\" >> .yarnrc.yml
                    echo \"enableGlobalCache: true\" >> .yarnrc.yml
                    sed -i \"s/127.0.0.1/172.17.0.1/ ; s/54321/$PGPORT/ ; s/63791/$REDISPORT/\" packages/backend/test/.env
                    docker builder create --name builder-$GIT_COMMIT_HASH --driver docker-container
                    """
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }

                parallel(
                    testenv: {
                        stage('Start test environment') {
                            sh """
                            PGPORT=$PGPORT REDISPORT=$REDISPORT docker compose -p rating-tracker-test-$GIT_COMMIT_HASH -f packages/backend/test/docker-compose.yml up --force-recreate -V -d
                            """
                        }
                    },

                    wasm: {
                        stage ('Compile WebAssembly utils') {
                            sh """
                            docker pull marvinruder/cache:rating-tracker-wasm || true
                            docker builder build --builder builder-$GIT_COMMIT_HASH --load -t $imagename:build-$GIT_COMMIT_HASH-wasm -f docker/Dockerfile-wasm --cache-to=type=inline .
                            docker image tag $imagename:build-$GIT_COMMIT_HASH-wasm marvinruder/cache:rating-tracker-wasm
                            docker push marvinruder/cache:rating-tracker-wasm
                            id=\$(docker create $imagename:build-$GIT_COMMIT_HASH-wasm)
                            docker cp \$id:/workdir/pkg/. ./packages/wasm
                            docker rm -v \$id
                            """
                        }
                    },

                    dep: {
                        stage ('Install dependencies') {
                            sh "mkdir -p /home/jenkins/.cache/yarn/global && cp -arn /home/jenkins/.cache/yarn/global ."
                            docker.build("$imagename:build-$GIT_COMMIT_HASH-yarn", "-f docker/Dockerfile-yarn .")
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
                            docker.build("$imagename:build-$GIT_COMMIT_HASH-test", "-f docker/Dockerfile-test .")
                            sh """
                            id=\$(docker create $imagename:build-$GIT_COMMIT_HASH-test)
                            mkdir -p coverage/{backend,commons,frontend}
                            docker cp \$id:/workdir/packages/backend/coverage/. ./coverage/backend
                            docker cp \$id:/workdir/packages/commons/coverage/. ./coverage/commons
                            docker cp \$id:/workdir/packages/frontend/coverage/. ./coverage/frontend
                            docker rm -v \$id
                            docker rmi $imagename:build-$GIT_COMMIT_HASH-test || true
                            """
                        }
                    },

                    build: {
                        stage ('Build Docker Image') {
                            image = docker.build("$imagename:build-$GIT_COMMIT_HASH", "-f docker/Dockerfile --build-arg BUILD_DATE=\$(date -u +'%Y-%m-%dT%H:%M:%SZ') .")
                        }
                    }

                )

                parallel(

                    codacy: {
                        stage ('Publish coverage results to Codacy') {
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
                            if (env.BRANCH_NAME == 'main') {
                                image.push('edge')
                                sh "mkdir -p /home/jenkins/.cache/README && cat README.md | sed 's|^<!-- <div id|<div id|g;s|</div> -->\$|</div>|g;s|\"/packages/frontend/public/assets|\"https://raw.githubusercontent.com/marvinruder/rating-tracker/main/packages/frontend/public/assets|g' > /home/jenkins/.cache/README/$GIT_COMMIT_HASH"
                                // sh "docker run --rm -t -v /tmp:/tmp -e DOCKER_USER -e DOCKER_PASS chko/docker-pushrm --file /tmp/jenkins-cache/README/$GIT_COMMIT_HASH $imagename"
                            } else if (!(env.BRANCH_NAME).startsWith('renovate')) {
                                image.push('SNAPSHOT')
                            }
                            if (env.TAG_NAME) {
                                def VERSION = sh (script: "echo \$TAG_NAME | sed 's/^v//' | tr -d '\\n'", returnStdout: true)
                                def MAJOR = sh (script: "/bin/bash -c \"if [[ \$TAG_NAME =~ ^v[0-9]+\\.[0-9]+\\.[0-9]+\$ ]]; then echo \$TAG_NAME | sed -E 's/^v([0-9]+)\\.([0-9]+)\\.([0-9]+)\$/\\1/' | tr -d '\\n'; fi\"", returnStdout: true)
                                def MINOR = sh (script: "/bin/bash -c \"if [[ \$TAG_NAME =~ ^v[0-9]+\\.[0-9]+\\.[0-9]+\$ ]]; then echo \$TAG_NAME | sed -E 's/^v([0-9]+)\\.([0-9]+)\\.([0-9]+)\$/\\1.\\2/' | tr -d '\\n'; fi\"", returnStdout: true)
                                if (MAJOR) {
                                    sh "docker builder build --builder builder-$GIT_COMMIT_HASH -f docker/Dockerfile --push --platform=linux/amd64,linux/arm64 --build-arg BUILD_DATE=\$(date -u +'%Y-%m-%dT%H:%M:%SZ') -t $imagename:$VERSION -t $imagename:$MINOR -t $imagename:$MAJOR -t $imagename:latest ."
                                } else {
                                    sh "docker builder build --builder builder-$GIT_COMMIT_HASH -f docker/Dockerfile --push --platform=linux/amd64,linux/arm64 --build-arg BUILD_DATE=\$(date -u +'%Y-%m-%dT%H:%M:%SZ') -t $imagename:$VERSION ."
                                }
                                sh """
                                docker images -f "dangling=true" -q | xargs -r docker rmi -f
                                docker volume ls -qf dangling=true | xargs -r docker volume rm
                                """
                            }
                        }
                    }
                )

            } finally {

                stage ('Cleanup') {
                    sh """
                    docker logout
                    docker compose -p rating-tracker-test-$GIT_COMMIT_HASH -f packages/backend/test/docker-compose.yml down -t 0            
                    docker rmi $imagename:build-$GIT_COMMIT_HASH || true
                    docker image prune --filter label=stage=build -f
                    docker builder prune -f --keep-storage 4G
                    docker builder rm builder-$GIT_COMMIT_HASH || true
                    docker container ls -f "name=buildx_buildkit_builder-$GIT_COMMIT_HASH" -q | xargs -r docker container rm -f || true
                    rm -rf global
                    """
                }

            }
        }
    }
}
