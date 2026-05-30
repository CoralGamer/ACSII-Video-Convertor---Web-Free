# 🎬 ASCII Player — Conversor de Video a ASCII & Generador de Prompts IA

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Deploy-GitHub_Pages-blue?style=for-the-badge&logo=github)

Una aplicación web de última generación, premium e interactiva que te permite reproducir y **convertir videos locales a texto ASCII animado** en tempo real, así como generar increíbles gráficos procedimentales mediante **prompts en lenguaje natural** al estilo de una Inteligencia Artificial.

Todo funciona de forma **100% local en tu navegador**, utilizando la GPU y CPU de tu propio dispositivo. ¡Tus archivos nunca se suben a ningún servidor, garantizando total privacidad, seguridad y velocidad sin límites!

Desplegado oficialmente en: **[https://coralgamer.github.io/ACSII-Video-Convertor---Web-Free/](https://coralgamer.github.io/ACSII-Video-Convertor---Web-Free/)**

---

## ✨ Características Premium y Funciones Actuales

*   **📽️ Conversor de Video Local (Sin Servidores)**: Arrastra y suelta (`Drag & Drop`) cualquier video (MP4 o WebM). Se procesa a nivel de cliente en milisegundos.
*   **⚡ Ajuste de Resolución Ultra-Rápido**: Controla la cantidad de columnas (de 40 a 180 columnas de resolución de texto) adaptando el renderizado en tiempo real.
*   **👁️ Profundidad y Escala de Grises Avanzada**:
    *   **Dithering Floyd-Steinberg**: Difusión de error de cuantización en tiempo real sobre una cuadrícula Float32 para generar texturas orgánicas suaves y eliminar el efecto de bandas de color en la consola ASCII.
    *   **Control Deslizante de Gamma**: Modifica de forma no lineal los tonos medios mediante curvas exponenciales de luminosidad para rescatar detalles en sombras y brillos.
*   **🎨 Paletas de Colores Neón e Hiper-Detalle**:
    *   *Monocromo CRT Blanco y Negro*: Estilo de consola clásico de alta intensidad.
    *   *CRT Fósforo Verde*: El emblemático look de terminal Matrix o Fallout.
    *   *CRT Ámbar Retro*: Aspecto vintage de computadoras de los años 80.
    *   *Color Real RGB*: Mapea cada caracter ASCII al color exacto de los píxeles originales.
    *   *Neon Cyberpunk*: Gradiente de barrido dinámico Cian y Magenta con resplandor digital.
    *   *Retro Vaporwave*: Degradado Sunset Teal y Rosa pastel de estética ochentera.
    *   *Lluvia Matrix (Verde/Blanco)*: Acentos dinámicos en verde esmeralda con cabezas de lluvia en blanco brillante para zonas de alta luminosidad.
*   **✨ Generador de Prompts IA a ASCII (100% Local)**:
    *   Escribe instrucciones como `matrix digital rain`, `3d rotating wireframe cube`, `cyberpunk cellular fire`, `mandelbrot zoom`, etc.
    *   El motor procedimental interpreta las palabras clave e inicia complejas simulaciones físicas, autómatas celulares de fuego y proyecciones trigonométricas 3D en caracteres ASCII.
*   **🔊 Grabación y Exportación Directa Corregida**:
    *   Captura el flujo visual del canvas junto con el canal de audio del reproductor mediante la API `MediaRecorder` del navegador de forma segura.
    *   **Solución a Congelamientos**: Desactiva el bucle automáticamente al exportar para permitir que la pista finalice de manera natural, cuenta con try-catch integrado para evitar fallos si el video no posee pista de audio, y añade una salvaguarda de fin de video por tiempo (`currentTime >= duration - 0.1`).
*   **💻 Banner CLI Especializado**:
    *   Integración de panel interactivo que enseña a los desarrolladores a clonar y correr la suite interactiva de comandos en terminal de consola. La última versión funcional de esta suite fue desarrollada al 100% por **CoralGamer** a través del repositorio: `https://github.com/stepanussaruran/ASCII-Video-Player`.
*   **🌍 Multi-Idioma Inteligente y Manuales Completos**: Enrutamiento estático optimizado para indexación SEO multilingüe en **Español, Inglés, Francés, Portugués y Alemán**. Incluye la traducción completa del **Manual Técnico y Guía Definitiva de Indexación** para cada uno de los 5 idiomas.
*   **👾 Favicon Cyberpunk SVG**: Icono de consola de comandos diseñado con trazados vectoriales SVG e integrado tanto en HTML estático como dinámico.

---

## 🛠️ Arquitectura Técnica y Tecnologías

La aplicación web ha sido construida exclusivamente con tecnologías vanilla para maximizar el rendimiento de renderizado a más de 60 FPS:

1.  **HTML5 Video & Offscreen Canvas**: Decodificación local de cuadros y análisis del búfer de píxeles en memoria.
2.  **Luminance Color Formula (NTSC BT.709)**: Conversión de componentes de color a escala de grises ponderando el espectro de color humano:
    $$Y = 0.2126 \cdot R + 0.7152 \cdot G + 0.0722 \cdot B$$
3.  **Algoritmo Floyd-Steinberg**: Distribución recursiva del error de aproximación lumínica hacia los píxeles adyacentes de la grilla ($X+1, Y-1, Y, Y+1$ con pesos de difracción $7/16, 3/16, 5/16, 1/16$) para simular tonos continuos a través de patrones de densidad de caracteres.
4.  **Gamma Mapping Math**: Corrección no lineal dinámica expresada mediante la función de potencia exponencial:
    $$\text{Gris}_{\text{final}} = \left(\frac{\text{Gris}_{\text{inicial}}}{255.0}\right)^{\frac{1}{\text{Gamma}}} \cdot 255.0$$
5.  **MediaRecorder API**: Grabación síncrona en cliente del render en canvas con pistas de audio locales para descargas instantáneas en WebM/MP4.
6.  **3D Math Software Engine**: Renderizador 3D por software escrito en JS que realiza transformaciones de matrices de rotación en los tres ejes (Pitch, Yaw, Roll) y proyección de perspectiva.

---

## 🚀 Cómo Ejecutar en Local

Puedes correr la aplicación localmente de forma extremadamente sencilla:

1.  Clona este repositorio o descarga la carpeta `web-app/`.
2.  **Método Directo**: Simplemente abre el archivo `index.html` en tu navegador favorito.
3.  **Servidor Local (Recomendado para evitar bloqueos CORS en algunos recursos externos)**:
    *   Si tienes Python instalado, ejecuta:
        ```bash
        python -m http.server 8000
        ```
    *   Si tienes Node.js, ejecuta:
        ```bash
        npx http-server ./ -p 8000
        ```
    *   Abre `http://localhost:8000` en tu navegador.

---

## 📈 Estructura SEO Avanzada e Indexación

Para maximizar el tráfico orgánico desde Google, el proyecto incorpora:
*   **Grafo JSON-LD Schema.org**: Estructura multilenguaje que fusiona tarjetas enriquecidas de **WebApplication**, **FAQPage** y **HowTo** en el código.
*   **Robots & Sitemap**: Configurados para el rastreo selectivo multilingüe.
*   **Artículos Educativos de Autoridad**: Redactados y optimizados semánticamente en el pie de página de la app, traduciéndose de forma completa a los 5 idiomas admitidos por la landing.

---

## ⚖️ Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Puedes consultar el texto íntegro y de libre uso en el archivo [LICENSE](LICENSE) ubicado en la raíz de esta carpeta.
