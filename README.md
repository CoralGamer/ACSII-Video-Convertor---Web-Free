# 🎬 ASCII Player — Conversor de Video a ASCII & Generador de Prompts IA

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Deploy-GitHub_Pages-blue?style=for-the-badge&logo=github)

Una aplicación web de última generación, premium e interactiva que te permite reproducir y **convertir videos locales a texto ASCII animado** en tiempo real, así como generar increíbles gráficos 3D procedimentales mediante **prompts en lenguaje natural** al estilo de una Inteligencia Artificial.

Todo funciona de forma **100% local en tu navegador**, utilizando la GPU y CPU de tu propio dispositivo. ¡Tus archivos nunca se suben a ningún servidor, garantizando total privacidad, seguridad y velocidad sin límites!

Desplegado oficialmente en: **[https://coralgamer.github.io/ACSII-Video-Convertor---Web-Free/](https://coralgamer.github.io/ACSII-Video-Convertor---Web-Free/)**

---

## ✨ Características Premium y Funciones

*   **📽️ Conversor de Video Local (Sin Servidores)**: Arrastra y suelta (`Drag & Drop`) cualquier video (MP4 o WebM). Se procesa a nivel de cliente en milisegundos.
*   **⚡ Ajuste de Resolución Ultra-Rápido**: Controla la cantidad de columnas (de 40 a 180 columnas de resolución de texto) adaptando el renderizado en tiempo real.
*   **🎨 Modos de Color y Filtros Retro**:
    *   *Monocromo CRT Blanco y Negro*: Estilo de consola clásico.
    *   *CRT Fósforo Verde*: El emblemático look de terminal Matrix o Fallout.
    *   *CRT Ámbar Retro*: Aspecto vintage de los años 80.
    *   *Color Real RGB*: Mapea cada caracter ASCII al color RGB real de los píxeles originales para un efecto visual alucinante.
*   **✨ Generador de Prompts IA a ASCII (100% Local)**:
    *   Escribe instrucciones como `matrix digital rain`, `3d rotating wireframe cube`, `cyberpunk cellular fire`, `mandelbrot zoom`, etc.
    *   El motor procedimental interpreta las palabras clave e inicia complejas simulaciones físicas y proyecciones trigonométricas 3D en vivo codificadas en caracteres ASCII.
*   **🔊 Grabación y Exportación Directa**:
    *   Captura el flujo visual del canvas junto con el canal de audio del reproductor.
    *   Genera y descarga un video MP4/WebM compilado y sincronizado de forma instantánea directamente en tu navegador.
*   **🌍 Multi-Idioma Inteligente**: Enrutamiento estático optimizado para indexación SEO multilingüe en **Español, Inglés, Francés, Portugués y Alemán**, ajustable dinámicamente mediante selector UI.
*   **📱 Diseño Totalmente Responsive**: La consola y los controles deslizantes se adaptan quirúrgicamente a pantallas móviles, tabletas y computadoras de escritorio.

---

## 🛠️ Arquitectura Técnica y Tecnologías

La aplicación web ha sido construida exclusivamente con tecnologías vanilla para maximizar el rendimiento de renderizado a más de 60 FPS:

1.  **HTML5 Video & Offscreen Canvas**: Decodificación local de cuadros y análisis del búfer de píxeles en memoria.
2.  **Luminance Color Formula**: Conversión de componentes de color a escala de grises de forma ponderada:
    $$\text{Brillo} = 0.2126 \cdot R + 0.7152 \cdot G + 0.0722 \cdot B$$
3.  **MediaRecorder API**: Grabación síncrona en cliente del render en canvas con pistas de audio locales para descargas instantáneas en WebM/MP4.
4.  **3D Math Software Engine**: Renderizador 3D por software escrito en JS que realiza transformaciones de matrices de rotación en los tres ejes (Pitch, Yaw, Roll) y proyección de perspectiva.

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
*   **Artículos Educativos de Autoridad**: Redactados y optimizados semánticamente en el pie de página de la app, permitiendo indexar más de 20 palabras clave de alta intención.

---

## ⚖️ Licencia

Este proyecto está licenciado bajo la **Licencia MIT**.

```
MIT License

Copyright (c) 2026 CoralGamer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
