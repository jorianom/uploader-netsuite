# uploader-netsuite README

Uploader NetSuite es una extensión para Visual Studio Code diseñada para facilitar la carga y sincronización de scripts en NetSuite directamente desde el editor. Con esta herramienta, puedes administrar tus scripts sin tener que salir del entorno de desarrollo.

## Principales características:

* Autenticación OAuth 1.0: Configura tus credenciales de NetSuite y autentícate de manera segura.
* Sincronización automática: Sube y actualiza tus scripts de NetSuite con un solo clic.
* Autoguardado: Guarda automáticamente los archivos antes de ser enviados.
* Snippets personalizados: Genera estructuras comunes de scripts en NetSuite (Suitelet, Restlet, Map/Reduce, etc.) con atajos de código.

## Requerimentos

Esta extensión requiere:
* NetSuite: Una cuenta válida con acceso a RESTlets o SuiteScripts.
* Credenciales OAuth 1.0: Para interactuar con los servicios de NetSuite (Consumer Key, Consumer Secret, Access Token, etc.).

## Configuración

Esta extensión añade las siguientes configuraciones al archivo de settings.json de VS Code:

* uploaderNetsuite.consumerKey: Tu Consumer Key para la autenticación en NetSuite.
* uploaderNetsuite.consumerSecret: Tu Consumer Secret para la autenticación en NetSuite.
* uploaderNetsuite.accessToken: Tu Access Token para NetSuite.
* uploaderNetsuite.tokenSecret: Tu Token Secret para NetSuite.
* uploaderNetsuite.realm: El ID de tu cuenta de NetSuite.
* Para configurar estas opciones, ve a Preferencias > Configuración y busca "Settings Uploader Netsuite".

## Problemas conocidos:

* La autenticación OAuth 1.0 puede fallar si las credenciales no son correctas.
* La función de exploración de archivos no es compatible con ciertos sistemas de archivos externos.

Si encuentras algún problema, por favor repórtalo en el [repositorio del proyecto.](https://github.com/jorianom/uploader-netsuite)

## Notas de versión
### 1.0.0
* Primera versión: Funcionalidades básicas de sincronización de scripts y autenticación.
### 1.0.1
* Nuevas características: Snippets para generar automáticamente scripts Suitelet, Restlet, Schedule y Map/Reduce.

**¡Disfruta desarrollando con Uploader NetSuite!**
