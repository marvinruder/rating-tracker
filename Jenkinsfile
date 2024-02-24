node('rating-tracker-build') {
    withEnv([
        'IMAGE_NAME=marvinruder/rating-tracker',
        'FORCE_COLOR=true',
        'DOCKER_CI_FLAGS=-f docker/Dockerfile-ci --network=host --cache-from=registry.internal.mruder.dev/cache:rating-tracker-wasm'
    ]) {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'), string(credentialsId: 'github_pat', variable: 'GH_TOKEN')]) {
            // Use random job identifier and test port numbers to avoid collisions
            def JOB_ID = sh (script: "#!/bin/bash\nprintf \"%04d\" \$((1 + RANDOM % 4096))", returnStdout: true)
            def PGPORT = sh (script: "#!/bin/bash\necho -n \$((49151 + 10#$JOB_ID))", returnStdout: true)
            def REDISPORT = sh (script: "#!/bin/bash\necho -n \$((53247 + 10#$JOB_ID))", returnStdout: true)
            def TESTPORT = sh (script: "#!/bin/bash\necho -n \$((57343 + 10#$JOB_ID))", returnStdout: true)

            try {
                parallel(
                    scm: {
                        stage('Clone repository') {
                            checkout scm
                        }
                    },
                    docker_env: {
                        stage('Start Docker environment') {
                            // Log in to Docker Hub
                            sh('echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin')

                            // Create builder instance and prefetch Docker base images
                            sh """
                            JENKINS_NODE_COOKIE=DONT_KILL_ME /bin/sh -c '(curl -Ls https://raw.githubusercontent.com/$IMAGE_NAME/\$BRANCH_NAME/docker/Dockerfile-prefetch | docker build -) &'
                            docker builder create --name rating-tracker --driver docker-container --driver-opt network=host --bootstrap || :
                            JENKINS_NODE_COOKIE=DONT_KILL_ME /bin/sh -c '(curl -Ls https://raw.githubusercontent.com/$IMAGE_NAME/\$BRANCH_NAME/docker/Dockerfile-prefetch-buildx | docker buildx build --builder rating-tracker --network=host --cache-from=registry.internal.mruder.dev/cache:rating-tracker-wasm -) &'
                            """
                        }
                    },
                    renovate_trigger: {
                        if (env.BRANCH_NAME == 'main') {
                            stage('Trigger Renovate Run') {
                                // Trigger a request for Renovate to run on the repository to rebase open pull requests after new commits on the `main` branch
                                sh """
                                set +x
                                DEPENDENCY_DASHBOARD_ISSUE_NUMBER=\$(curl -sL -H "Authorization: Bearer \$GH_TOKEN" https://api.github.com/repos/$IMAGE_NAME/issues | grep "Dependency Dashboard" -B 1 | head -n 1 | tr -dc '0-9') && \
                                DEPENDENCY_DASHBOARD_BODY=\$(curl -sL -H "Authorization: Bearer \$GH_TOKEN" https://api.github.com/repos/$IMAGE_NAME/issues/\$DEPENDENCY_DASHBOARD_ISSUE_NUMBER | grep '"body":' | sed 's/- \\[ \\] <!-- manual job -->/- \\[x\\] <!-- manual job -->/ ; s/,\$//') && \
                                curl -fsSL -o /dev/null -w '%{response_code}\n' -X PATCH -H "Authorization: Bearer \$GH_TOKEN" https://api.github.com/repos/$IMAGE_NAME/issues/\$DEPENDENCY_DASHBOARD_ISSUE_NUMBER -d "{\$DEPENDENCY_DASHBOARD_BODY}"
                                set -x
                                """
                            }
                        }
                    }
                )

                parallel(
                    testenv: {
                        stage('Start test environment') {
                            // Inject IP and ports into test environment
                            sh """
                            sed -i \"s/postgres-test:5432/127.0.0.1:$PGPORT/ ; s/redis-test:6379/127.0.0.1:$REDISPORT/ ; s/30001/$TESTPORT/\" packages/backend/test/env.ts
                            PGPORT=$PGPORT REDISPORT=$REDISPORT docker compose -p rating-tracker-test-job$JOB_ID -f packages/backend/test/docker-compose.yml up --force-recreate -V -d
                            """
                        }
                    },
                    wasm: {
                        stage ('Compile WebAssembly utils') {
                            // Build the WebAssembly image while using registry cache
                            sh("docker buildx build --builder rating-tracker $DOCKER_CI_FLAGS --target=wasm --cache-to=registry.internal.mruder.dev/cache:rating-tracker-wasm .")
                        }
                    },
                    dep: {
                        stage ('Install dependencies') {
                            // Change config files for use in CI, copy global cache to workspace and install dependencies
                            sh """
                            echo \"globalFolder: /workdir/cache/yarn/global\" >> .yarnrc.yml
                            mkdir -p \$HOME/.cache/yarn/global ./cache/yarn/global
                            cp -arln \$HOME/.cache/yarn/global ./cache/yarn || :
                            docker build $DOCKER_CI_FLAGS --target=yarn .
                            """
                        }
                    }
                )

                stage ('Run tests and build bundles') {
                    docker.build("$IMAGE_NAME:job$JOB_ID-ci", "$DOCKER_CI_FLAGS --force-rm .")

                    // Copy build artifacts and cache files to workspace
                    sh """
                    id=\$(docker create $IMAGE_NAME:job$JOB_ID-ci)
                    docker cp \$id:/app/. ./app
                    docker cp \$id:/cache/. ./cache
                    docker cp \$id:/coverage/. ./coverage
                    docker rm -v \$id
                    """
                }

                parallel(
                    codacy: {
                        stage ('Process test results') {
                            withCredentials([string(credentialsId: 'codacy-project-token-rating-tracker', variable: 'CODACY_PROJECT_TOKEN')]) {
                                // Publish coverage results by running a container from the test image
                                sh('docker run --rm -e CODACY_PROJECT_TOKEN=$CODACY_PROJECT_TOKEN ' + "$IMAGE_NAME:job$JOB_ID-ci report -r /coverage/*/cobertura-coverage.xml --commit-uuid \$(git log -n 1 --pretty=format:'%H'); docker rmi $IMAGE_NAME:job$JOB_ID-ci")
                            }
                            sh('ls -l ./coverage/*/*.xml')
                            recordCoverage qualityGates: [[criticality: 'NOTE', integerThreshold: 100, metric: 'LINE', threshold: 100.0], [baseline: 'PROJECT_DELTA', criticality: 'NOTE', metric: 'LINE']], tools: [[parser: 'COBERTURA', pattern: './coverage/*/cobertura-coverage.xml'], [parser: 'JUNIT', pattern: './coverage/*/junit.xml']]
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
                                tags += " -t $IMAGE_NAME:$VERSION"

                                // Check for semver syntax
                                if (MAJOR) {
                                    // Use the major and minor version as additional tags
                                    tags += " -t $IMAGE_NAME:$MINOR -t $IMAGE_NAME:$MAJOR -t $IMAGE_NAME:latest"
                                }
                            } else if (env.BRANCH_NAME == 'main') {
                                // Images with tag `edge` are built from the main branch
                                tags += " -t $IMAGE_NAME:edge"

                                // Prepare update of README.md
                                sh("mkdir -p \$HOME/.cache/README && cat README.md | sed 's|^<!-- <div id|<div id|g;s|</div> -->\$|</div>|g;s|\"/packages/frontend/public/assets|\"https://raw.githubusercontent.com/$IMAGE_NAME/main/packages/frontend/public/assets|g' > \$HOME/.cache/README/job$JOB_ID")
                                // sh("docker run --rm -t -v /tmp:/tmp -e DOCKER_USER -e DOCKER_PASS chko/docker-pushrm --file /tmp/jenkins-cache/README/job$JOB_ID $IMAGE_NAME")
                            } else if (!(env.BRANCH_NAME).startsWith('renovate')) {
                                // Images with tag `snapshot` are built from other branches, except when updating dependencies only
                                tags += " -t $IMAGE_NAME:SNAPSHOT"
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
                    // Upload cache to external storage and remove build artifacts
                    sh """#!/bin/bash
                    cp -arln ./cache/yarn \$HOME/.cache
                    putcache
                    PGPORT=$PGPORT REDISPORT=$REDISPORT docker compose -p rating-tracker-test-job$JOB_ID -f packages/backend/test/docker-compose.yml down -t 0            
                    docker rmi $IMAGE_NAME:job$JOB_ID-wasm $IMAGE_NAME:job$JOB_ID-ci || :
                    rm -rf app cache
                    """
                }
            }
        }
    }
}
