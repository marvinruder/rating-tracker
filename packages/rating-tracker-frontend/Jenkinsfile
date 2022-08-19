node {
    withEnv([
        'imagename=marvinruder/rating-tracker-frontend',
        'main_tag=latest',
        'branch_tag=SNAPSHOT'
    ]) {

        def GIT_COMMIT_HASH

        stage('Clone repository') {
            checkout scm
            GIT_COMMIT_HASH = sh (script: "git log -n 1 --pretty=format:'%H'", returnStdout: true)
        }

        stage ('Run Tests') {
            nodejs(nodeJSInstallationName: 'NodeJS') {
                sh 'yarn install'
                sh 'yarn test:ci'
            }
        }

        def image

        stage ('Build Docker Image') {
            image = docker.build("$imagename:build-$GIT_COMMIT_HASH")
        }

        stage ('Publish Docker Image') {
            docker.withRegistry('', 'dockerhub') {
                if (env.BRANCH_NAME == 'origin/main') {
                    image.push(main_tag)
                } else {
                    image.push(branch_tag)
                }
            }
        }

        stage ('Cleanup') {
            sh "docker rmi $imagename:build-$GIT_COMMIT_HASH || true"
            if (env.BRANCH_NAME == 'main') {
                sh "docker rmi $imagename:$main_tag || true"
            } else {
                sh "docker rmi $imagename:$branch_tag || true"
            }
        }
    }
}
