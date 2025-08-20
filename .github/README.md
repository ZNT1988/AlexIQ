# GitHub Actions & SonarQube Configuration

## Configuration Files

### 🔧 GitHub Actions Workflows

- **`build.yml`**: Build principal avec analyse SonarQube Cloud
- **`ci.yml`**: Pipeline d'intégration continue existant
- **`codeql.yml`**: Analyse de sécurité CodeQL existant
- **`sonarcloud.yml`**: Configuration SonarCloud existante

### 📊 SonarQube Configuration

Le fichier `sonar-project.properties` à la racine configure:

- **Project Key**: `NT1988_AlexIQ`
- **Organization**: `alexiq`
- **Sources analysées**: `backend/`, `frontend/src/`
- **Exclusions**: node_modules, logs, bases de données, fichiers temporaires

## 🚀 Setup Instructions

### 1. Secrets GitHub requis

Ajoutez ces secrets dans votre repository GitHub:

```
SONAR_TOKEN: [Votre token SonarQube Cloud]
GITHUB_TOKEN: [Auto-généré par GitHub]
```

### 2. Configuration SonarQube Cloud

1. Allez sur https://sonarcloud.io
2. Connectez-vous avec GitHub
3. Créez un nouveau projet avec la clé `NT1988_AlexIQ`
4. Configurez l'organisation `alexiq`
5. Récupérez le token d'authentification

### 3. Tests inclus

Le pipeline exécute automatiquement:
- ✅ **Phase 1**: Context Intelligence Tests
- ✅ **Phase 2**: Response Generation Tests  
- ✅ **Phase 3**: Autonomous Adaptation Tests
- 📊 **ESLint**: Analyse statique du code
- 📈 **SonarQube**: Analyse qualité et sécurité

## 🎯 Triggers

Les workflows s'exécutent sur:
- Push vers `main` et `minimal-prod`
- Pull Requests (ouverture, synchronisation, réouverture)

## 📋 Rapports générés

- **eslint-report.json**: Rapport ESLint
- **Coverage reports**: Si configurés
- **Test artifacts**: Résultats des tests Phase 1-3
- **SonarQube Quality Gate**: Validation qualité automatique

## 🔒 Sécurité

- Analyse CodeQL intégrée
- Validation des secrets
- Quality Gate obligatoire
- Timeout de sécurité sur les étapes