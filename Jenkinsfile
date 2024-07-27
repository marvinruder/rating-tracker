node('rating-tracker-build') {
  withEnv([
    'IMAGE_NAME=marvinruder/rating-tracker',
    'FORCE_COLOR=true'
  ]) {
    withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
      // Use random job identifier to avoid image tag collisions
      def JOB_ID = sh (script: "#!/bin/bash\nprintf \"%04d\" \$((1 + RANDOM % 4096))", returnStdout: true)
      def DOCKER_BUILD_FLAGS = sh (script: "#!/bin/bash\necho -n \"--build-arg BUILD_DATE='\$(date -u +'%Y-%m-%dT%H:%M:%SZ')'\"", returnStdout: true)

      try {
        parallel(
          scm: {
            stage('Checkout repository') {
              checkout scm
            }
          },
          docker_env: {
            stage('Start Docker environment') {
              // Log in to Docker Hub
              sh('echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin')

              // Create builder instance
              sh("docker builder create --name rating-tracker --node rating-tracker --driver docker-container --bootstrap")
            }
          }
        )

        parallel(
          ci: {
            stage ('Run tests and build bundles') {
              sh("docker buildx build --builder rating-tracker $DOCKER_BUILD_FLAGS --target=result --cache-from registry.internal.mruder.dev/cache:rating-tracker-wasm -t $IMAGE_NAME:job$JOB_ID --load .")
            }
          },
          deploy_base: {
            stage ('Prepare base image for deployment') {
              sh("docker buildx build --builder rating-tracker $DOCKER_BUILD_FLAGS --target=deploy-base --platform=linux/amd64,linux/arm64 .")
            }
          }
        )

        parallel(
          codacy: {
            stage ('Publish coverage results to Codacy') {
              withCredentials([string(credentialsId: 'codacy-project-token-rating-tracker', variable: 'CODACY_PROJECT_TOKEN')]) {
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
              } else if (!(env.BRANCH_NAME).startsWith('renovate')) {
                // Images with tag `snapshot` are built from other branches, except when updating dependencies only
                tags += " -t $IMAGE_NAME:SNAPSHOT"
              }

              // If tags are present, build and push the image for both amd64 and arm64 architectures
              if (tags.length() > 0) {
                sh("docker buildx build --builder rating-tracker $DOCKER_BUILD_FLAGS --target=deploy --platform=linux/amd64,linux/arm64 --push $tags .")
              }
            }
          }
        )
      } catch (error) {
        currentBuild.result = 'FAILURE'
        throw error
      } finally {
        stage ('Cleanup') {
          if (currentBuild.getCurrentResult() == "SUCCESS") {
            // Upload cache to external storage
            sh("docker buildx build --builder rating-tracker $DOCKER_BUILD_FLAGS --target=wasm --cache-to type=registry,ref=registry.internal.mruder.dev/cache:rating-tracker-wasm,compression=zstd,compression-level=0 .")
          }
          // Remove build artifacts
          sh """#!/bin/bash
          docker rmi $IMAGE_NAME:job$JOB_ID || :
          """
        }
      }
    }
  }
}
