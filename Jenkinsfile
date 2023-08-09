node('rating-tracker-build') {
    withEnv([
        'imagename=marvinruder/rating-tracker',
        'FORCE_COLOR=true'
    ]) {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {

            def JOB_ID
            def image
            def PGPORT
            def REDISPORT

            try {

                parallel(

                    scm: {
                        stage('Clone repository') {
                            checkout scm
                            JOB_ID = sh (script: "printf \"%04d\" \$((1 + RANDOM % 8192))", returnStdout: true)
                            PGPORT = sh (script: "echo -n \$((49151 + $JOB_ID))", returnStdout: true)
                            REDISPORT = sh (script: "echo -n \$((57343 + $JOB_ID))", returnStdout: true)
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
                            sh """
                            docker buildx build --builder rating-tracker --load -t $imagename:job$JOB_ID-wasm -f docker/Dockerfile-wasm --cache-from=marvinruder/cache:rating-tracker-wasm --cache-to=marvinruder/cache:rating-tracker-wasm .
                            id=\$(docker create $imagename:job$JOB_ID-wasm)
                            docker cp \$id:/workdir/pkg/. ./packages/wasm
                            docker rm -v \$id
                            docker rmi $imagename:job$JOB_ID-wasm || true
                            """
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
                            docker rmi $imagename:job$JOB_ID-yarn || true
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
                            docker rmi $imagename:job$JOB_ID-build || true
                            """
                        }
                    }

                )

                parallel(

                    codacy: {
                        stage ('Publish coverage results to Codacy') {
                            lock('codacy-coverage-reporter') {
                                withCredentials([string(credentialsId: 'codacy-project-token-rating-tracker', variable: 'CODACY_PROJECT_TOKEN')]) {
                                    sh('docker run --rm -e CODACY_PROJECT_TOKEN=$CODACY_PROJECT_TOKEN ' + "$imagename:job$JOB_ID-test report \$(find . -name 'lcov.info' -printf '-r %p ') --commit-uuid \$(git log -n 1 --pretty=format:'%H')")
                                }
                            }
                            sh("docker rmi $imagename:job$JOB_ID-test || true")
                        }
                    },

                    dockerhub: {
                        stage ('Assemble and publish Docker Image') {
                            image = docker.build("$imagename:job$JOB_ID", "-f docker/Dockerfile-assemble --build-arg BUILD_DATE=\$(date -u +'%Y-%m-%dT%H:%M:%SZ') .")
                            if (env.BRANCH_NAME == 'main') {
                                image.push('edge')
                                sh("mkdir -p /home/jenkins/.cache/README && cat README.md | sed 's|^<!-- <div id|<div id|g;s|</div> -->\$|</div>|g;s|\"/packages/frontend/public/assets|\"https://raw.githubusercontent.com/marvinruder/rating-tracker/main/packages/frontend/public/assets|g' > /home/jenkins/.cache/README/job$JOB_ID")
                                // sh("docker run --rm -t -v /tmp:/tmp -e DOCKER_USER -e DOCKER_PASS chko/docker-pushrm --file /tmp/jenkins-cache/README/job$JOB_ID $imagename")
                            } else if (!(env.BRANCH_NAME).startsWith('renovate')) {
                                image.push('SNAPSHOT')
                            }
                            if (env.TAG_NAME) {
                                def VERSION = sh (script: "echo -n \$TAG_NAME | sed 's/^v//'", returnStdout: true)
                                def MAJOR = sh (script: "/bin/bash -c \"if [[ \$TAG_NAME =~ ^v[0-9]+\\.[0-9]+\\.[0-9]+\$ ]]; then echo -n \$TAG_NAME | sed -E 's/^v([0-9]+)\\.([0-9]+)\\.([0-9]+)\$/\\1/'; fi\"", returnStdout: true)
                                def MINOR = sh (script: "/bin/bash -c \"if [[ \$TAG_NAME =~ ^v[0-9]+\\.[0-9]+\\.[0-9]+\$ ]]; then echo -n \$TAG_NAME | sed -E 's/^v([0-9]+)\\.([0-9]+)\\.([0-9]+)\$/\\1.\\2/'; fi\"", returnStdout: true)
                                if (MAJOR) {
                                    sh("docker buildx build --builder rating-tracker -f docker/Dockerfile --push --platform=linux/amd64,linux/arm64 --build-arg BUILD_DATE=\$(date -u +'%Y-%m-%dT%H:%M:%SZ') -t $imagename:$VERSION -t $imagename:$MINOR -t $imagename:$MAJOR -t $imagename:latest .")
                                } else {
                                    sh("docker buildx build --builder rating-tracker -f docker/Dockerfile --push --platform=linux/amd64,linux/arm64 --build-arg BUILD_DATE=\$(date -u +'%Y-%m-%dT%H:%M:%SZ') -t $imagename:$VERSION .")
                                }
                            }
                        }
                    }
                )

            } finally {

                stage ('Cleanup') {
                    sh """
                    docker logout
                    docker compose -p rating-tracker-test-job$JOB_ID -f packages/backend/test/docker-compose.yml down -t 0            
                    docker rmi $imagename:job$JOB_ID || true
                    docker image prune --filter label=stage=build -f
                    docker builder prune -f --keep-storage 4G
                    rm -rf global
                    """
                }

            }
        }
    }
}
