node {
    withEnv([
        'imagename=marvinruder/rating-tracker',
        'main_tag=latest',
        'branch_tag=SNAPSHOT',
        'FORCE_COLOR=true'
    ]) {

        def GIT_COMMIT_HASH

        stage('Clone repository') {
            checkout scm
            GIT_COMMIT_HASH = sh (script: "git log -n 1 --pretty=format:'%H'", returnStdout: true)
        }

        // stage('Create yarn caches') {
        //     nodejs(nodeJSInstallationName: 'node19') {
        //         sh 'yarn'
        //     }
        // }

        stage ('Run Tests') {
            docker.build("$imagename:build-$GIT_COMMIT_HASH-test", "-f Dockerfile-test .")
            sh """
            id=\$(docker create $imagename:build-$GIT_COMMIT_HASH-test)
            docker cp \$id:/app/. .
            docker rm -v \$id
            curl -Os https://uploader.codecov.io/latest/linux/codecov
            chmod +x ./codecov
            """
            withCredentials([string(credentialsId: 'codecov-token-rating-tracker', variable: 'CODECOV_TOKEN')]) {
                sh "./codecov -s packages/rating-tracker-backend/coverage -C $GIT_COMMIT_HASH"
            }
        }

        def image

        stage ('Build Docker Image') {
            image = docker.build("$imagename:build-$GIT_COMMIT_HASH")
        }

        stage ('Publish Docker Image') {
            docker.withRegistry('', 'dockerhub') {
                if (env.BRANCH_NAME == 'main') {
                    image.push(main_tag)
                } else if (!(env.BRANCH_NAME).startsWith('renovate')) {
                    image.push(branch_tag)
                }
            }
        }

        stage ('Cleanup') {
            sh """
            docker rmi $imagename:build-$GIT_COMMIT_HASH-test || true
            docker rmi $imagename:build-$GIT_COMMIT_HASH || true
            """
            if (env.BRANCH_NAME == 'main') {
                sh "docker rmi $imagename:$main_tag || true"
            } else if (!(env.BRANCH_NAME).startsWith('renovate')) {
                sh "docker rmi $imagename:$branch_tag || true"
            }
        }
    }
}
