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

                            // Use random job identifier and test port numbers to avoid collisions
                            JOB_ID = sh (script: "#!/bin/bash\nprintf \"%04d\" \$((1 + RANDOM % 8192))", returnStdout: true)
                            PGPORT = sh (script: "#!/bin/bash\necho -n \$((49151 + 10#$JOB_ID))", returnStdout: true)
                            REDISPORT = sh (script: "#!/bin/bash\necho -n \$((57343 + 10#$JOB_ID))", returnStdout: true)
                        }
                    },
                    docker_env: {
                        stage('Start Docker environment') {
                            // Log in to Docker Hub
                            sh('echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin')

                            // Create builder instance
                            sh "docker builder create --name rating-tracker --driver docker-container || :"
                        }
                    }
                )

                parallel(
                    testenv: {
                        stage('Start test environment') {
                            // Create migration script from all migrations and inject IP and ports into test environment
                            sh """
                            cat packages/backend/prisma/migrations/*/migration.sql > packages/backend/test/all_migrations.sql
                            sed -i \"s/54321/$PGPORT/ ; s/63791/$REDISPORT/\" packages/backend/test/.env
                            PGPORT=$PGPORT REDISPORT=$REDISPORT docker compose -p rating-tracker-test-job$JOB_ID -f packages/backend/test/docker-compose.yml up --force-recreate -V -d
                            """
                        }
                    },
                    wasm: {
                        stage ('Compile WebAssembly utils') {
                            // Acquire mutex to avoid collisions while working with the marvinruder/rating-tracker:wasm image
                            lock('rating-tracker-wasm') {
                                // Build the WebAssembly image while using registry cache
                                sh("docker buildx build --builder rating-tracker --build-arg BUILDKIT_INLINE_CACHE=1 --load -t $imagename:wasm -f docker/Dockerfile-wasm --cache-from=marvinruder/cache:rating-tracker-wasm --cache-to=marvinruder/cache:rating-tracker-wasm .")
                            }
                        }
                    },
                    dep: {
                        stage ('Install dependencies') {
                            // Change config files for use in CI and copy global cache to workspace
                            sh """
                            echo \"globalFolder: /workdir/global\npreferAggregateCacheInfo: true\nenableGlobalCache: true\" >> .yarnrc.yml
                            mkdir -p /home/jenkins/.cache/yarn/global
                            cp -arn /home/jenkins/.cache/yarn/global . || :
                            ([ ! -f ".eslintcache" ] && cp -a /home/jenkins/.cache/.eslintcache .) || :
                            """

                            // Install dependencies
                            docker.build("$imagename:job$JOB_ID-yarn", "-f docker/Dockerfile-yarn .")

                            // Copy dependencies to workspace and cache
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
                            docker.build("$imagename:job$JOB_ID-test", "-f docker/Dockerfile-test --force-rm .")
                        }
                    },
                    build: {
                        stage ('Build Docker Image') {
                            docker.build("$imagename:job$JOB_ID-build", "-f docker/Dockerfile-build --force-rm .")

                            // Copy build artifacts to workspace
                            sh """
                            id=\$(docker create $imagename:job$JOB_ID-build)
                            docker cp \$id:/workdir/app/. ./app
                            docker cp \$id:/workdir/.eslintcache ./.eslintcache
                            docker rm -v \$id
                            docker rmi $imagename:job$JOB_ID-build
                            cp -a ./.eslintcache /home/jenkins/.cache/.eslintcache
                            """
                        }
                    }
                )

                parallel(
                    codacy: {
                        stage ('Publish coverage results to Codacy') {
                            withCredentials([string(credentialsId: 'codacy-project-token-rating-tracker', variable: 'CODACY_PROJECT_TOKEN')]) {
                                // Publish coverage results by running a container from the test image
                                sh('docker run --rm -e CODACY_PROJECT_TOKEN=$CODACY_PROJECT_TOKEN ' + "$imagename:job$JOB_ID-test report \$(find . -name 'lcov.info' -printf '-r %p ') --commit-uuid \$(git log -n 1 --pretty=format:'%H'); docker rmi $imagename:job$JOB_ID-test")
                            }
                        }
                    },
                    dockerhub: {
                        stage ('Assemble and publish Docker Image') {
                            // Identify image tags
                            def tags = ""
                            if (env.TAG_NAME) {
                                // A version tag is present
                                def VERSION = sh (script: "echo -n \$TAG_NAME | sed 's/^v//'", returnStdout: true)
                                def MAJOR = sh (script: "#!/bin/bash\nif [[ \$TAG_NAME =~ ^v[0-9]+\\.[0-9]+\\.[0-9]+\$ ]]; then echo -n \$TAG_NAME | sed -E 's/^v([0-9]+)\\.([0-9]+)\\.([0-9]+)\$/\\1/'; fi", returnStdout: true)
                                def MINOR = sh (script: "#!/bin/bash\nif [[ \$TAG_NAME =~ ^v[0-9]+\\.[0-9]+\\.[0-9]+\$ ]]; then echo -n \$TAG_NAME | sed -E 's/^v([0-9]+)\\.([0-9]+)\\.([0-9]+)\$/\\1.\\2/'; fi", returnStdout: true)

                                // Use the tag explicitly
                                tags += " -t $imagename:$VERSION"

                                // Check for semver syntax
                                if (MAJOR) {
                                    // Use the major and minor version as additional tags
                                    tags += " -t $imagename:$MINOR -t $imagename:$MAJOR -t $imagename:latest"
                                }
                            } else if (env.BRANCH_NAME == 'main') {
                                // Images with tag `edge` are built from the main branch
                                tags += " -t $imagename:edge"

                                // Prepare update of README.md
                                sh("mkdir -p /home/jenkins/.cache/README && cat README.md | sed 's|^<!-- <div id|<div id|g;s|</div> -->\$|</div>|g;s|\"/packages/frontend/public/assets|\"https://raw.githubusercontent.com/marvinruder/rating-tracker/main/packages/frontend/public/assets|g' > /home/jenkins/.cache/README/job$JOB_ID")
                                // sh("docker run --rm -t -v /tmp:/tmp -e DOCKER_USER -e DOCKER_PASS chko/docker-pushrm --file /tmp/jenkins-cache/README/job$JOB_ID $imagename")
                            } else if (!(env.BRANCH_NAME).startsWith('renovate')) {
                                // Images with tag `snapshot` are built from other branches, except when updating dependencies only
                                tags += " -t $imagename:SNAPSHOT"
                            }

                            // If tags are present, build and push the image for both amd64 and arm64 architectures
                            if (tags.length() > 0) {
                                sh("docker buildx build --builder rating-tracker -f docker/Dockerfile --force-rm --push --platform=linux/amd64,linux/arm64 --build-arg BUILD_DATE=\$(date -u +'%Y-%m-%dT%H:%M:%SZ') $tags .")
                            }
                        }
                    }
                )
            } finally {
                stage ('Cleanup') {
                    // Remove credentials and build artifacts
                    sh """
                    docker logout
                    docker compose -p rating-tracker-test-job$JOB_ID -f packages/backend/test/docker-compose.yml down -t 0            
                    docker rmi $imagename:job$JOB_ID $imagename:job$JOB_ID-build $imagename:job$JOB_ID-test $imagename:job$JOB_ID-yarn || :
                    rm -rf global app
                    """
                }
            }
        }
    }
}
