// ============================================================
//  Jenkinsfile  ->  va en la RAIZ del repo
//  Workflow (lo que pidio tu docente):
//    commit -> build inicia -> stage de construir lanza la IaC
//    (terraform) -> se ven los cambios en cloud.
// ============================================================
pipeline {
    agent any

    // ---- Variables de entorno del pipeline ----
    environment {
        AWS_REGION = 'us-east-1'
        EB_BUCKET = 'nexus-eb-deploys-619891987841'

        // Credenciales guardadas en Jenkins (Manage Jenkins -> Credentials).
        // NUNCA van escritas aqui en texto plano.
        AWS_ACCESS_KEY_ID     = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')

        // Secretos de la app -> Terraform los lee como TF_VAR_*
        TF_VAR_secret_key          = credentials('nexus-secret-key')
        TF_VAR_db_password         = credentials('nexus-db-password')
        TF_VAR_email_host_user     = credentials('nexus-email-user')
        TF_VAR_email_host_password = credentials('nexus-email-password')
        TF_VAR_anthropic_api_key   = credentials('nexus-anthropic-key')
    }

    stages {

        // ---- 1. Traer el codigo del commit ----
        stage('Checkout') {
            steps {
                checkout scm
                echo "Codigo descargado del commit: ${env.GIT_COMMIT}"
            }
        }

        // ---- 2. BUILD: construir las imagenes con los cambios nuevos ----
        stage('Build') {
            steps {
                echo 'Construyendo imagenes Docker de backend y frontend...'
                sh 'docker compose build'
            }
        }

        // ---- 3. TEST: validaciones rapidas ----
        stage('Test') {
            steps {
                echo 'Validando configuracion de Django...'
                // 'check' valida que el proyecto no tenga errores graves
                sh 'docker compose run --rm backend python manage.py check'
            }
        }

        // ---- 4. IaC: aqui se "lanza la infraestructura" con Terraform ----
        //      (este es el stage clave que pide el docente)
        stage('Terraform - Provisionar Infra (IaC)') {
            steps {
                dir('infra') {
                    echo 'Inicializando Terraform...'
                    sh 'terraform init -input=false'

                    echo 'Planificando cambios de infraestructura...'
                    sh 'terraform plan -input=false -out=tfplan'

                    echo 'Aplicando: creando/actualizando la infra en AWS...'
                    sh 'terraform apply -input=false -auto-approve tfplan'
                }
            }
        }

        // ---- 5. DEPLOY: subir la nueva version de la app a Elastic Beanstalk ----
        stage('Deploy a Elastic Beanstalk') {
            steps {
                echo 'Empaquetando y desplegando la nueva version...'
                sh '''
                    # Empaqueta el codigo (incluye docker-compose.yml y Dockerfiles)
                    zip -r nexus-app.zip . -x "*.git*" "infra/*" "*/node_modules/*" "*/venv/*"

                    VERSION="nexus-$(date +%Y%m%d%H%M%S)"

                    # Sube el zip a S3
                    aws s3 cp nexus-app.zip s3://${EB_BUCKET}/$VERSION.zip --region $AWS_REGION

                    # Crea la version de la aplicacion en EB
                    aws elasticbeanstalk create-application-version \
                        --application-name nexus-app \
                        --version-label $VERSION \
                        --source-bundle S3Bucket=${EB_BUCKET},S3Key=$VERSION.zip \
                        --region $AWS_REGION

                    # Actualiza el entorno para que use la nueva version
                    aws elasticbeanstalk update-environment \
                        --environment-name nexus-env \
                        --version-label $VERSION \
                        --region $AWS_REGION
                '''
            }
        }
    }

    // ---- Que hacer al terminar (exito o fallo) ----
    post {
        success {
            echo 'Pipeline completado. Los cambios ya estan en la nube.'
        }
        failure {
            echo 'El pipeline fallo. Revisa los logs del stage que se puso en rojo.'
        }
    }
}
