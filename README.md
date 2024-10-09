# uploader-netsuite README

Uploader NetSuite es una extensión para Visual Studio Code diseñada para facilitar la carga y sincronización de scripts en NetSuite directamente desde el editor. Con esta herramienta, puedes administrar tus scripts sin tener que salir del entorno de desarrollo.

[Visita Marketplace](https://marketplace.visualstudio.com/items?itemName=jorianom.uploader-netsuite) 

## Principales características:

* Autenticación OAuth 1.0: Configura tus credenciales de NetSuite y autentícate de manera segura.
* Sincronización automática: Sube y actualiza tus scripts de NetSuite con un solo comando.
* Autoguardado: Guarda automáticamente los archivos antes de ser enviados.
* Snippets personalizados: Genera estructuras comunes de scripts en NetSuite (Suitelet, Restlet, Map/Reduce, etc.) con atajos de código.

## Requerimentos

Esta extensión requiere:
* NetSuite: Una cuenta válida con acceso a RESTlets o SuiteScripts.
* Credenciales OAuth 1.0: Para interactuar con los servicios de NetSuite (Consumer Key, Consumer Secret, Access Token, etc.).
* Implementación del script tipo restlet en tu cuenta de netsuite: Lo puedes encontrar [aca](https://github.com/jorianom/uploader-netsuite/blob/master/resources/script/script_restlet.js). 

## Configuración

Esta extensión añade las siguientes configuraciones al archivo de settings.json de VS Code:

* uploaderNetsuite.consumerKey: Tu Consumer Key para la autenticación en NetSuite.
* uploaderNetsuite.consumerSecret: Tu Consumer Secret para la autenticación en NetSuite.
* uploaderNetsuite.accessToken: Tu Access Token para NetSuite.
* uploaderNetsuite.tokenSecret: Tu Token Secret para NetSuite.
* uploaderNetsuite.consumerKeyPD: Tu Consumer Key para la autenticación en NetSuite.
* uploaderNetsuite.consumerSecretPD: Tu Consumer Secret para la autenticación en NetSuite.
* uploaderNetsuite.accessTokenPD: Tu Access Token para NetSuite.
* uploaderNetsuite.tokenSecretPD: Tu Token Secret para NetSuite.
* uploaderNetsuite.realm: El ID de tu cuenta de NetSuite.
* Para configurar estas opciones, ve a Archivo > Preferencias > Configuración y busca "Settings Uploader Netsuite".

## Cómo usar Uploader NetSuite

### Comandos

Exta extensión ofrece varios comandos útiles que puedes ejecutar desde la paleta de comandos de Visual Studio Code. Para acceder a la paleta de comandos, presiona `Ctrl+Shift+P` y escribe el nombre del comando.
Aquí tienes una lista de los comandos disponibles:

- **`Push File to NetSuite`**
  - Sube el archivo actual a NetSuite y crea un `backup` solo si no existe uno previamente.
  
- **`Push PD File to NetSuite`**
  - Compara el archivo local con el backup en `backupPD`. Después de revisar las diferencias, podrás hacer clic  en el botón `Enviar archivo a NetSuite`, ubicado en la barra de estado. Este botón te permitirá seleccionar y confirmar el envío del archivo al entorno de producción (NetSuite PD).
  
- **`Pull File from NetSuite`**
  - Recupera el archivo actual desde NetSuite y lo guarda en el directorio local del proyecto.
  
### Snippets
- Snippet: **`nmapreduce`** Crea una estructura básica de un **`Map/Reduce`** Script en NetSuite
- Snippet: **`nrestlet`** Crea una estructura básica de un **`Restlet`** en NetSuite
- Snippet: **`nsuitelet`** Crea una estructura básica de un **`Suitelet`** en NetSuite
- Snippet: **`nscheduled`** Crea una estructura básica de un **`Scheduled`** Script en NetSuite
- Snippet: **`npublic`** Crea una estructura básica de un **`módulo público`** en NetSuite

## Problemas conocidos:

* La autenticación OAuth 1.0 puede fallar si las credenciales no son correctas.
* La función de exploración de archivos no es compatible con ciertos sistemas de archivos externos.

Si encuentras algún problema, por favor repórtalo en el [repositorio del proyecto.](https://github.com/jorianom/uploader-netsuite)

## Notas de versión
### 1.0.0
* **Primera versión**: Funcionalidades básicas de sincronización de scripts y autenticación.
### 1.1.0
* **Nuevas características**: Snippets para generar automáticamente scripts Suitelet, Restlet, Schedule y Map/Reduce.
* **Nueva funcionalidad**: Backups automáticos de archivos antes de enviarlos a NetSuite. Los archivos se almacenan en una carpeta llamada `backup` en el directorio del proyecto y se asegura que no se sobrescriban
### 1.2.0
* **Nueva funcionalidad**: Comparación de archivos locales con `backupPD` antes de enviarlos a NetSuite PD.
* **Nueva funcionalidad**: Comando interactivo para subir archivos a producción después de la revisión de cambios.

**¡Disfruta desarrollando con Uploader NetSuite!**
