#!/bin/bash
# ============================================================
#  setup-jenkins-ec2.sh
#  Instala Jenkins + Docker + Terraform + AWS CLI en una EC2
#  Ubuntu 22.04/24.04. Ejecutalo con: bash setup-jenkins-ec2.sh
# ============================================================
set -e

echo "==> Actualizando sistema..."
sudo apt-get update -y
sudo apt-get install -y openjdk-17-jre wget gnupg unzip curl

# ---------- Jenkins ----------
echo "==> Instalando Jenkins..."
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | \
    sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
    https://pkg.jenkins.io/debian-stable binary/" | \
    sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y jenkins
sudo systemctl enable jenkins
sudo systemctl start jenkins

# ---------- Docker ----------
echo "==> Instalando Docker..."
sudo apt-get install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker
# Permite que Jenkins use Docker sin sudo
sudo usermod -aG docker jenkins

# ---------- Terraform ----------
echo "==> Instalando Terraform..."
TF_VERSION="1.9.8"
wget -q https://releases.hashicorp.com/terraform/${TF_VERSION}/terraform_${TF_VERSION}_linux_amd64.zip
unzip -o terraform_${TF_VERSION}_linux_amd64.zip
sudo mv terraform /usr/local/bin/
rm terraform_${TF_VERSION}_linux_amd64.zip

# ---------- AWS CLI ----------
echo "==> Instalando AWS CLI v2..."
curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
sudo ./aws/install
rm -rf awscliv2.zip aws/

# Reinicia Jenkins para que tome el grupo docker
sudo systemctl restart jenkins

echo ""
echo "============================================================"
echo " LISTO. Verifica versiones:"
terraform version | head -1
aws --version
docker --version
echo ""
echo " Clave inicial de Jenkins (la necesitas en el navegador):"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
echo ""
echo " Abre:  http://<IP-PUBLICA-DE-TU-EC2>:8080"
echo "============================================================"
