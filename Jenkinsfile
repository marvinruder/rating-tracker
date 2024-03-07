node('rating-tracker-build') {
  withEnv([
    'IMAGE_NAME=marvinruder/rating-tracker',
    'FORCE_COLOR=true',
    'DOCKER_CI_FLAGS=--add-host postgres-test:127.0.0.1 --add-host redis-test:127.0.0.1 --allow security.insecure'
  ]) {
    withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
      // Use random job identifier and test port numbers to avoid collisions
      def JOB_ID = sh (script: "#!/bin/bash\nprintf \"%04d\" \$((1 + RANDOM % 4096))", returnStdout: true)
      def BUILD_DATE = sh (script: "#!/bin/bash\necho -n \$(date -u +'%Y-%m-%dT%H:%M:%SZ')", returnStdout: true)

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
              
              // Create builder instance and prebuild Docker images
              sh """
              docker builder create --name rating-tracker --driver docker-container --driver-opt network=host --buildkitd-flags '--allow-insecure-entitlement security.insecure' --bootstrap || :
              JENKINS_NODE_COOKIE=DONT_KILL_ME /bin/sh -c "(curl -Ls https://raw.githubusercontent.com/$IMAGE_NAME/\$BRANCH_NAME/Dockerfile | sed -n '/### deploy ###/q;p' | docker buildx build --builder rating-tracker --platform=linux/amd64,linux/arm64 --build-arg BUILD_DATE='$BUILD_DATE' --target=deploy -) &"
              """
            }
          }
        )

        stage ('Run tests and build bundles') {
          // Build image, copy build artifacts and cache files to workspace
          sh """
          cp -arln \$HOME/.cache . || :
          docker buildx build --builder rating-tracker $DOCKER_CI_FLAGS --target=result --cache-from=registry.internal.mruder.dev/cache:rating-tracker-wasm -t $IMAGE_NAME:job$JOB_ID --load .
          id=\$(docker create $IMAGE_NAME:job$JOB_ID)
          docker cp \$id:/app/. ./app
          docker rm -v \$id
          """
        }

        parallel(
          codacy: {
            stage ('Publish coverage results to Codacy') {
              withCredentials([string(credentialsId: 'codacy-project-token-rating-tracker', variable: 'CODACY_PROJECT_TOKEN')]) {
                // Publish coverage results by running a container from the test image
                sh('docker run --rm -e CODACY_PROJECT_TOKEN=$CODACY_PROJECT_TOKEN ' + "$IMAGE_NAME:job$JOB_ID report --commit-uuid \$(git log -n 1 --pretty=format:'%H')")
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
                sh("docker buildx build --builder rating-tracker --platform=linux/amd64,linux/arm64 --build-arg BUILD_DATE='$BUILD_DATE' --target=deploy --push $tags .")
              }
            }
          }
        )
      } finally {
        stage ('Cleanup') {
          // Upload cache to external storage and remove build artifacts
          sh """#!/bin/bash
          docker buildx build --builder rating-tracker $DOCKER_CI_FLAGS --target=wasm --cache-to=registry.internal.mruder.dev/cache:rating-tracker-wasm .
          id=\$(docker create $IMAGE_NAME:job$JOB_ID)
          docker cp \$id:/.cache/. ./.cache
          docker rm -v \$id
          docker rmi $IMAGE_NAME:job$JOB_ID || :
          cp -arln ./.cache \$HOME
          putcache
          rm -rf app .cache
          """
        }
      }
    }
  }
}
