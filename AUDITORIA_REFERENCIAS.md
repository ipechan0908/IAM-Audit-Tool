# Auditoría de fuente — SentinelID

## Registro original
- **Alumno:** Eduardo Moises Ochoa Alva
- **Correo:** eduardoochoa2003@gmail.com
- **Tipo:** aplicacion_movil
- **Estilo solicitado:** ["Minimalista","Tecnológico","Profesional"]
- **Sensación solicitada:** Sí, rápido. Llénalo así:
- ¿Qué deseas crear? → Aplicación (App)
- Estilo deseado → Tecnológico + Profesional + Minimalista
- ¿Qué sensación debería transmitir la web?
  Una plataforma tecnológica, profesional y confiable, orientada a Identity & Access Management y ciberseguridad. Debe transmitir seguridad, control, claridad y facilidad de uso, con una interfaz moderna y limpia tipo consola empresarial.
- **Descripción del negocio:** Aplicación de Identity & Access Management (IAM) apoyada por agentes de inteligencia artificial. Permitirá consultar y administrar información de usuarios, grupos, aplicaciones y accesos. La primera versión se conectará con Okta mediante APIs/MCP y permitirá hacer consultas en lenguaje natural. A futuro podrá integrarse con Microsoft Entra ID e Identity Governance.
- **Detalles técnicos:** Dashboard principal, consulta de usuarios, grupos y aplicaciones, asistente de IA, búsqueda en lenguaje natural, visualización de resultados y registro de consultas. El MVP debe conectarse inicialmente con Okta y dejar la arquitectura preparada para integrar Entra ID. Diseño profesional, tecnológico y minimalista.

## Logotipo, imágenes y archivos
El Excel no contiene imágenes, archivos incrustados, dibujos, relaciones de hipervínculos ni logotipos. El logotipo, favicon, portada social e ilustraciones de este prototipo son **originales y provisionales**. Los logos y fotografías de las páginas de referencia no se copiaron porque pertenecen a terceros y no identifican al alumno.

## Auditoría de referencias
| Referencia | Estado | Hallazgo |
|---|---|---|
| `https://www.okta.com/` | verificado | Sitio accesible; referencia de gestión de identidades y acceso. |
| `https://www.microsoft.com/en-us/security/business/microsoft-entra` | verificado | Sitio accesible; referencia de identidad, acceso, Zero Trust e integración. |
| `https://www.sailpoint.com/` | verificado | Sitio accesible; referencia de identidad adaptativa y gobierno de accesos. |

## Supuestos explícitos
- SentinelID es una identidad conceptual; no se proporcionó marca ni logo.
- El dashboard utiliza datos sintéticos y no ejecuta cambios reales.
- La integración MCP/API requiere un backend seguro, secretos, scopes y pruebas.

## Arquitectura entregada
- `index.html` — **Inicio** (home)
- `dashboard.html` — **Dashboard** (dashboard)
- `identidades.html` — **Identidades** (catalog)
- `grupos.html` — **Grupos** (catalog)
- `aplicaciones.html` — **Aplicaciones** (catalog)
- `asistente.html` — **Asistente IA** (assistant)
- `auditoria.html` — **Auditoría** (library)
- `integraciones.html` — **Integraciones** (architecture)
- `privacidad.html` — política base para adaptar
- `accesibilidad.html` — declaración de accesibilidad
- `404.html` — página de error no indexable
- `robots.txt`, `sitemap.xml`, `sitemap.template.xml`, `llms.txt`, `knowledge.json`, `manifest.webmanifest`

## Integraciones no simuladas como reales
La interfaz puede demostrar búsquedas, dashboards, formularios, catálogos, chat o calculadoras; no se conectaron pagos, autenticación, bases de datos, WhatsApp, CRM, LMS, IAM, Oracle ni modelos de IA porque el registro no incluye credenciales, infraestructura ni reglas operativas aprobadas.
