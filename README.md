# 🛡️ Mini Phishing Detector

Este proyecto permite analizar correos electrónicos y clasificarlos como phishing, sospechosos o legítimos usando inteligencia artificial. La estructura está organizada para ser modular, escalable y fácil de mantener.

---

## 📦 Estructura del Proyecto

```commandline
src/
├─ interfaces/
│ ├─ ai_service.py # Interfaz para servicios de IA
│ ├─ email_validator.py # Interfaz para validación de correos
│ ├─ repository.py # Interfaz para acceso a repositorios
├─ models/
│ ├─ email_request.py # Modelo de entrada: datos del correo
│ ├─ validation_result.py # Modelo de salida: resultado de validación
├─ services/
│ ├─ cosmos_repository.py # Implementación Cosmos DB
│ ├─ email_validation_service.py# Lógica de validación principal
│ ├─ openai_service.py # Servicio conexión OpenAI u otro modelo
├─ utils/
│ ├─ constantes.py # Constantes globales
│ ├─ container.py # Contenedor de dependencias
.env # Variables de entorno y credenciales
.gitignore
function_app.py # Punto de entrada principal (API)
```


---

## 🚀 ¿Cómo funciona?

- Recibe una solicitud para analizar un correo electrónico.
- Usa modelos de IA (por defecto OpenAI) para determinar si el email es phishing, sospechoso o válido.
- Devuelve resultados claramente estructurados y explicados.
- Permite integración con Cosmos DB y fácil ampliación a nuevos servicios o modelos.

---

## 📝 Instalación

1. **Clonar el repositorio:**
