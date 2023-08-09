node('rating-tracker-build') {
    withEnv([
        'imagename=marvinruder/rating-tracker',
        'FORCE_COLOR=true'
    ]) {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
            def JOB_ID
            def PGPORT
            def REDISPORT

            try {
                parallel(
                    scm: {
                        stage('Clone repository') {
                            checkout scm
                            JOB_ID = sh (script: "#!/bin/bash\nprintf \"%04d\" \$((1 + RANDOM % 8192))", returnStdout: true)
                            PGPORT = sh (script: "#!/bin/bash\necho -n \$((49151 + 10#$JOB_ID))", returnStdout: true)
                            REDISPORT = sh (script: "#!/bin/bash\necho -n \$((57343 + 10#$JOB_ID))", returnStdout: true)
                            sh """
                            echo \"globalFolder: /workdir/global\" >> .yarnrc.yml
                            echo \"preferAggregateCacheInfo: true\" >> .yarnrc.yml
                            echo \"enableGlobalCache: true\" >> .yarnrc.yml
                            sed -i \"s/127.0.0.1/172.17.0.1/ ; s/54321/$PGPORT/ ; s/63791/$REDISPORT/\" packages/backend/test/.env
                            """
                        }
                    },
                    docker_env: {
                        stage('Start Docker environment') {
                            sh('echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin')
                            sh "docker builder create --name rating-tracker --driver docker-container || true"
                        }
                    }
                )

                parallel(
                    testenv: {
                        stage('Start test environment') {
                            sh("PGPORT=$PGPORT REDISPORT=$REDISPORT docker compose -p rating-tracker-test-job$JOB_ID -f packages/backend/test/docker-compose.yml up --force-recreate -V -d")
                        }
                    },
                    wasm: {
                        stage ('Compile WebAssembly utils') {
                            lock('rating-tracker-wasm') {
                                sh("docker buildx build --builder rating-tracker --build-arg BUILDKIT_INLINE_CACHE=1 --load -t $imagename:wasm -f docker/Dockerfile-wasm --cache-from=marvinruder/cache:rating-tracker-wasm --cache-to=marvinruder/cache:rating-tracker-wasm .")
                            }
                        }
                    },
                    dep: {
                        stage ('Install dependencies') {
                            sh("mkdir -p /home/jenkins/.cache/yarn/global && cp -arn /home/jenkins/.cache/yarn/global .")
                            docker.build("$imagename:job$JOB_ID-yarn", "-f docker/Dockerfile-yarn .")
                            sh """
                            id=\$(docker create $imagename:job$JOB_ID-yarn)
                            docker cp \$id:/workdir/.yarn/. ./.yarn
                            docker cp \$id:/workdir/global .
                            docker cp \$id:/workdir/.pnp.cjs .
                            docker cp \$id:/workdir/packages/backend/prisma/client/. ./packages/backend/prisma/client
                            docker rm -v \$id
                            docker rmi $imagename:job$JOB_ID-yarn
                            cp -arn ./global /home/jenkins/.cache/yarn
                            """
                        }
                    }
                )

                parallel(
                    test: {
                        stage ('Run Tests') {
                            docker.build("$imagename:job$JOB_ID-test", "-f docker/Dockerfile-test .")
                        }
                    },
                    build: {
                        stage ('Build Docker Image') {
                            docker.build("$imagename:job$JOB_ID-build", "-f docker/Dockerfile-build .")
                            sh """
                            id=\$(docker create $imagename:job$JOB_ID-build)
                            docker cp \$id:/workdir/app/. ./app
                            docker rm -v \$id
                            docker rmi $imagename:job$JOB_ID-build
                            """
                        }
                    }
                )

                parallel(
                    codacy: {
                        stage ('Publish coverage results to Codacy') {
                            withCredentials([string(credentialsId: 'codacy-project-token-rating-tracker', variable: 'CODACY_PROJECT_TOKEN')]) {
                                sh('docker run --rm -e CODACY_PROJECT_TOKEN=$CODACY_PROJECT_TOKEN ' + "$imagename:job$JOB_ID-test report \$(find . -name 'lcov.info' -printf '-r %p ') --commit-uuid \$(git log -n 1 --pretty=format:'%H'); docker rmi $imagename:job$JOB_ID-test")
                            }
                        }
                    },
                    dockerhub: {
                        stage ('Assemble and publish Docker Image') {
                            def tags = ""
                            if (env.TAG_NAME) {
                                def VERSION = sh (script: "echo -n \$TAG_NAME | sed 's/^v//'", returnStdout: true)
                                def MAJOR = sh (script: "#!/bin/bash\nif [[ \$TAG_NAME =~ ^v[0-9]+\\.[0-9]+\\.[0-9]+\$ ]]; then echo -n \$TAG_NAME | sed -E 's/^v([0-9]+)\\.([0-9]+)\\.([0-9]+)\$/\\1/'; fi", returnStdout: true)
                                def MINOR = sh (script: "#!/bin/bash\nif [[ \$TAG_NAME =~ ^v[0-9]+\\.[0-9]+\\.[0-9]+\$ ]]; then echo -n \$TAG_NAME | sed -E 's/^v([0-9]+)\\.([0-9]+)\\.([0-9]+)\$/\\1.\\2/'; fi", returnStdout: true)
                                tags += " -t $imagename:$VERSION"
                                if (MAJOR) {
                                    tags += " -t $imagename:$MINOR -t $imagename:$MAJOR -t $imagename:not-latest"
                                }
                            } else if (env.BRANCH_NAME == 'main') {
                                tags += " -t $imagename:edge"
                                sh("mkdir -p /home/jenkins/.cache/README && cat README.md | sed 's|^<!-- <div id|<div id|g;s|</div> -->\$|</div>|g;s|\"/packages/frontend/public/assets|\"https://raw.githubusercontent.com/marvinruder/rating-tracker/main/packages/frontend/public/assets|g' > /home/jenkins/.cache/README/job$JOB_ID")
                                // sh("docker run --rm -t -v /tmp:/tmp -e DOCKER_USER -e DOCKER_PASS chko/docker-pushrm --file /tmp/jenkins-cache/README/job$JOB_ID $imagename")
                            } else if (!(env.BRANCH_NAME).startsWith('renovate')) {
                                tags += " -t $imagename:SNAPSHOT"
                            }
                            if (tags.length() > 0) {
                                sh("docker buildx build --builder rating-tracker -f docker/Dockerfile --push --platform=linux/amd64,linux/arm64 --build-arg BUILD_DATE=\$(date -u +'%Y-%m-%dT%H:%M:%SZ') $tags .")
                            }
                        }
                    }
                )
            } finally {
                stage ('Cleanup') {
                    sh """
                    docker logout
                    docker compose -p rating-tracker-test-job$JOB_ID -f packages/backend/test/docker-compose.yml down -t 0            
                    docker rmi $imagename:job$JOB_ID $imagename:job$JOB_ID-build $imagename:job$JOB_ID-test $imagename:job$JOB_ID-yarn || true
                    docker builder prune -f --keep-storage 2G
                    docker builder prune --builder rating-tracker -f --keep-storage 2G
                    rm -rf global app
                    """
                }
            }
        }
    }
}
