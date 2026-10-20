
## Overview
Any section in this document should be made scalable. I should be able to add blogs, projects, experience, and new features/pages easily without changing too much of the codebase. The website should be made scalable for multiple desktop resolutions. The website will become a PWA but that will be dealt with after the main website is built. Website colors should be easily interchangable. Do not over engineer the project, make sure code is properly documented with comments.

### Tech Stack
Use HTML, CSS, and Javascript to build the main website. I would like the number of visitors to be tracked via GoatCounter (recommended by Claude) or some other service. I would also like the information from the
Contact Page to be sent to my email when the "Submit" button is pressed.

### Links Needed
- [GitHub](https://github.com/dev-rygy)
- [LinkedIn](https://www.linkedin.com/in/ryancarpenter1184/)
- [X](https://x.com/dev_rygy)
- [Facebook](https://www.facebook.com/ryan.carpenter.756412/)
- [Itch.io](https://dev-rygy.itch.io/)

### EmailJS IDs
- Public API Key (YvZjzYc8N4wpiVIC5)
- Service ID (service_x4ukigb)
- Template ID (template_sdx3uy4)

## Page Header | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=53-509&t=s3R2CAaOGkKCEq8f-4)
The top of each page on the website has a 'Page Header'. The header contains my name, my professional title, a motion graphic, and a nav bar with links to each major page on the website. (Home, Projects, Shaders, Blog, Contact)

### My Name | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=53-574&t=eiIs27UAu3t49zE2-4)
My name on the left side of the page ["Ryan Carpenter"](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=53-484&t=eiIs27UAu3t49zE2-4) has an animated typewriter effect like typing a command into the terminal. This animation will only run once, as the [Heavy Vertical Bar](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=22-213&t=eiIs27UAu3t49zE2-4) pans to the right. Once the name is fully displayed the 'Heavy Vertical Bar' will blink on and off like a cursor in the terminal.

### Motion Graphic
A provided file "header_graphic.gif" will serve as the motion graphic on the middle of the bar. This graphic will loop it's frames. A multi-colored noise filter will overlay the graphic.

### Nav Bar | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=53-487&t=eiIs27UAu3t49zE2-4)
Docked to the right side of the nav bar are the links to each of the major pages: **Home, Projects, Shaders, Blog, and Contact**. Hovering over each page link will spawn a uniform underline underneath it, the underline will grow to a max length and then shrink once the user stops hovering over it.

## Page Footer | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=60-1010&t=abYsA8pRasAoZbL3-4)
The bottom of each page will contain a footer. On the left, the footer will include [my name and a short description about what I do](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=60-990&t=eiIs27UAu3t49zE2-4). In the middle [my contact information and availability](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=60-993&t=eiIs27UAu3t49zE2-4). On the right, [my current availability](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=60-997&t=eiIs27UAu3t49zE2-4). Finally [links to my socials](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=60-1003&t=eiIs27UAu3t49zE2-4) will be docked in the bottom left corner.

## Homepage | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=8-3&t=s3R2CAaOGkKCEq8f-4)
### Hero Section | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=8-27&t=eiIs27UAu3t49zE2-4)
The intro will feature a [greeting with my name](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=195-2550&t=eiIs27UAu3t49zE2-4) and a short intro about myself. In addition to those things, there will be [two buttons](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=8-34&t=eiIs27UAu3t49zE2-4), one that will take the user straight to the [Projects Page](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=53-482&t=eiIs27UAu3t49zE2-4) and one that will let the user download a PDF of my resume. 
Finally, at the bottom of the into will be [icons/links](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=2110-1295&t=eiIs27UAu3t49zE2-4) to each of my socials. I believe you can simply just use "fa-" hrefs to get the icons you need.

On the side of the intro will be a [Project Carousel](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=8-39&t=eiIs27UAu3t49zE2-4). Each carousel video is provided in the source-media/carousel folder (web-ready copies are generated into assets/video/carousel with `npm run media`). [progress bars](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=2050-1089&t=eiIs27UAu3t49zE2-4) sit below the carousel the percentage fill on each progress bar relates to the time of the currently playing carousel video. When the user hovers over a progress indicator it will highlight and when they click it it will skip to that respective video. Progress bars are shown in a horizontal list, depending on how many videos are selected to sit in the carousel (maximum of 6 .mp4 videos).

### Featured Projects Section | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=14-103&t=s3R2CAaOGkKCEq8f-4)
Under the hero section is the featured project section. This section lists out my projects [as cards](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=19-176&t=eiIs27UAu3t49zE2-4) from my list of projects, it will list the projects in a grid-like fashion from left to right. The projects listed are personally selected by me. The new rows will grow as projects are added to the list (4 cards per row). On the bottom of the list is a ["See More" button](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=19-619&t=eiIs27UAu3t49zE2-4), this will navigate the user to the [Projects Page](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=53-482&t=eiIs27UAu3t49zE2-4). 

Each project [card](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=19-176&t=eiIs27UAu3t49zE2-4) will feature an video thumbnail with a [status chip](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=94-3006&t=eiIs27UAu3t49zE2-4) docked on the upper right corner of the [Project Showcase](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=195-1916&t=eiIs27UAu3t49zE2-4). The statuses could be [SHIPPED (green)](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=94-3010&t=eiIs27UAu3t49zE2-4), [PROTOTYPE (blue)](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=94-3007&t=eiIs27UAu3t49zE2-4), and [AWAITING PUBLICATION (YELLOW)](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=94-3002&t=eiIs27UAu3t49zE2-4). The project title, game genre, and date is below that. Furthermore, under that are the [role chips](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=60-642&t=eiIs27UAu3t49zE2-4) I took on the project with their own chips. A short form description of the project is under that. Finally [links](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=19-174&t=uOmWHRbtvHi7Ltst-4) to the projects steam/itch/github are docked at the bottom as icons, a separation line exists between the description and links. When the user hovers over the card a ["Learn More"](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=2091-1224&t=uOmWHRbtvHi7Ltst-4) button is displayed over the project showcase, the thumbnail is blurred. Clicking that button takes the user to the page for that specific project.

### Latest Blog Posts Section | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=69-2139&t=s3R2CAaOGkKCEq8f-4)
This is a very similar section to the project section although this section will display my latest blogs in chronological order. This section lists out my blogs as [cards](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=94-3478&t=eiIs27UAu3t49zE2-4) from my list of blogs, it will list the blogs in a grid-like fashion from left to right. The new rows will grow as projects are added to the list (4 cards per row). On the bottom of the list is a ["See More" button](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=69-2154&t=eiIs27UAu3t49zE2-4), this will navigate the user to the main "Blogs" page.

Each [blog card](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=94-3478&t=fgbzmD5dT7aQdamU-4) will feature an image/video thumbnail. The blog title, game genre, and date is below that. A short summary of the blog is under that. When the user hovers over the card a ["Learn More" button](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=2091-1270&t=fgbzmD5dT7aQdamU-4) is displayed over the thumbnail, the thumbnail is blurred. Clicking that button takes the user to the page for that specific project.

### Experience Section | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=122-928&t=s3R2CAaOGkKCEq8f-4)
This section lists my experience as a [vertical list](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=122-932&t=eiIs27UAu3t49zE2-4) from most recent to least. Each element has a photo, company name, role, dates, and a description. 
### Engineering Toolset | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=31-218&t=s3R2CAaOGkKCEq8f-4)
This section lists all my programming languages and tools that I know. This section lists languages, tech stacks, and specialties as a vertical list of [chips](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=39-345&t=eiIs27UAu3t49zE2-4).
### Education Section | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=39-272&t=s3R2CAaOGkKCEq8f-4)
This section lists my education as a [vertical list](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=39-277&t=eiIs27UAu3t49zE2-4) from most recent to least. Each element has a photo, school name, degree earned, dates, and a description. 
### Homepage CTA | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=39-291&t=s3R2CAaOGkKCEq8f-4)
This is a very simple section that consists of a question and two buttons. The "Contact Me" button takes the user to the main contact page. The "Email Me" button will take the user directly to my email.

---
## Projects Page | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=53-482&t=s3R2CAaOGkKCEq8f-4)
The projects page lists out all of my projects from my list of projects.
### Page Header | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=195-2583&t=eiIs27UAu3t49zE2-4)
A header/title and short description of the page's purpose.
### Projects List | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=60-691&t=Tq7Gxj2YeTNA4OF1-4)
Under the header. This section lists out my projects from my list of projects as [large cards](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=94-3411&t=Tq7Gxj2YeTNA4OF1-4) (bigger than the ones on the home page), it will list the projects in a grid-like fashion from left to right. The projects listed will be in chronological order, unlike the home page where I select the ones I want shown individually. The new rows will grow as projects are added to the list.

Each project element will feature an [Project Showcase](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=195-2207&t=Tq7Gxj2YeTNA4OF1-4) with a [status chip](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=94-3006&t=Tq7Gxj2YeTNA4OF1-4) docked on the right hand corner. The statuses could be [SHIPPED (green)](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=94-3010&t=eiIs27UAu3t49zE2-4), [PROTOTYPE (blue)](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=94-3007&t=eiIs27UAu3t49zE2-4), and [AWAITING PUBLICATION (YELLOW)](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=94-3002&t=eiIs27UAu3t49zE2-4).  Furthermore, under that are the [role chips](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=60-642&t=eiIs27UAu3t49zE2-4) I took on the project with their own chips. A long form summary of the project is under that. Finally [links](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=19-174&t=uOmWHRbtvHi7Ltst-4) to the projects steam/itch/github are docked at the bottom as icons, a separation line exists between the description and links. When the user hovers over the card a ["Learn More"](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=2091-1224&t=uOmWHRbtvHi7Ltst-4) button is displayed over the project showcase, the thumbnail is blurred. Clicking that button takes the user to the page for that specific project.

## Shaders Page | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=69-1552&t=s3R2CAaOGkKCEq8f-4)
The shaders page lists out all of my shaders from my list of shaders.
### Page Header | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=195-2588&t=s3R2CAaOGkKCEq8f-4)
A header/title and short description of the page's purpose.
### Shaders List | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=69-1560&t=Tq7Gxj2YeTNA4OF1-4)
Under the header. This section lists out my projects from my list of shasers, it will list them in a grid-like fashion from left to right (3 cards per row). The shaders listed will be in chronological order based on when they were made. The new rows will grow as shaders are added to the list.

Each [shader element](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=94-3457&t=Tq7Gxj2YeTNA4OF1-4) will feature an image/video thumbnail with a status chip docked on the right hand corner. The shader title, programming language/stack, and date is below that. A long-form description of the shader is under that. Finally links to the shader's github are docked at the bottom, a separation line exists between the description and links. When the user hovers over the card a ["Learn More button"](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=2091-1308&t=Tq7Gxj2YeTNA4OF1-4) is displayed over the thumbnail, the thumbnail is blurred. Clicking that button takes the user to the page for that specific project.

## Blog Page | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=69-2331&t=s3R2CAaOGkKCEq8f-4)
The blog page lists out all of my blogs from my list of blogs.
### Page Header | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=195-2593&t=s3R2CAaOGkKCEq8f-4)
A header/title and short description of the page's purpose.
### Blog List | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=69-2339&t=Tq7Gxj2YeTNA4OF1-4)
Under the header. This section lists out my projects from my list of blogs, it will list the blogs in a grid-like fashion from left to right. The blogs listed will be in chronological order based on when they were made. The new rows will grow as blog are added to the list (4 cards per row).

Each [blog card](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=94-3478&t=fgbzmD5dT7aQdamU-4) will feature an image/video thumbnail. The blog title, game genre, and date is below that. A short summary of the blog is under that. When the user hovers over the card a ["Learn More" button](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=2091-1270&t=fgbzmD5dT7aQdamU-4) is displayed over the thumbnail, the thumbnail is blurred. Clicking that button takes the user to the page for that specific project.

## Contacts Page | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=80-2752&t=s3R2CAaOGkKCEq8f-4)
The contact page is where the user may enter their information to contact me. 

### Page Header | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=195-2605&t=s3R2CAaOGkKCEq8f-4)
A header/title and short description of the page's purpose.

### Send Message Pane | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=80-2969&t=3GWeMdr5OLme9yCc-4)
The [send message pane](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=80-2969&t=3GWeMdr5OLme9yCc-4) consists of text fields for the messenger's name, email, and message.  Each field is a reusable [Input Field](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=2096-1414&t=3GWeMdr5OLme9yCc-4). If any field is left blank an error will be displayed next to the ["Submit" button](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=80-2994&t=Tq7Gxj2YeTNA4OF1-4), "Error: Please fill in all required information." Another error can occur if the email can not be sent, e.g. the email is in an incorrect format or it cannot be found, "Error: Please enter a valid email." Once the ["Submit" button](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=80-2994&t=Tq7Gxj2YeTNA4OF1-4) is pressed the message will be formated and sent to my email, ryan.carpenter1184@gmail.com.

## Project Page | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=177-928&t=s3R2CAaOGkKCEq8f-4)
The project page lists the details and technical features of a specific project I worked on.

### Overview | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=177-934&t=s3R2CAaOGkKCEq8f-4)
Lists a short video (mp4 or YouTube) of the project on the left and a long-form description of it on the right. Underneath the video format is a [metrics pane](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=2110-1167&t=Tq7Gxj2YeTNA4OF1-4). The [project metrics pane](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=2110-1185&t=Tq7Gxj2YeTNA4OF1-4) lists project links (git/steam/itch/etc), the engine it was built in, the role I undertook on the project, and finally the platforms it was made for.

### Technical Features Sections | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=177-1116&t=s3R2CAaOGkKCEq8f-4)
Lists each feature out one by one, one on top of the other. Any [related blog post cards](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=177-1160&t=Tq7Gxj2YeTNA4OF1-4) will be listed below the related feature in a horizontal grid (4 cards per line). If there are NO related blogs then the related blogs subsection is removed entirely from the feature.

### Thoughts and Reflection | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=180-1409&t=s3R2CAaOGkKCEq8f-4)
This section contains the contents of a postmortem regarding a project. On the left is a long photo that stretches to the full size of the section. On the right are a bunch of [questions with headers](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=180-1425&t=Tq7Gxj2YeTNA4OF1-4;) and my answers below them.

## Generic Page | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=180-1488&t=s3R2CAaOGkKCEq8f-4)
The generic page lists the description/content of a blog/shader/vfx. This generic page can have a variety of different layouts depending on the content provided. This page should be flexible to changes and more content.

### Next / Prev Page Selection | [Figma](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=2093-1651&t=Tq7Gxj2YeTNA4OF1-4)
This element exists on the [Project Page](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=2093-1664&t=Tq7Gxj2YeTNA4OF1-4) and [Generic Page](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=2093-1652&t=Tq7Gxj2YeTNA4OF1-4). These both go back and forth through there respective lists.

## Elements Page
This page exists as an html file but is not accessable by users of the website. THis will list out all the common elements that I could potentially put into a [generic page](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=180-1488&t=Tq7Gxj2YeTNA4OF1-4).

### Components I Want On This Page
- [Media Placeholder](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=195-1821&t=Tq7Gxj2YeTNA4OF1-4)
- [Display Chips](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=39-346&t=Tq7Gxj2YeTNA4OF1-4)
- [Metic Pane](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=2110-1167&t=Tq7Gxj2YeTNA4OF1-4)
- [Code Block](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=2036-1064&t=Tq7Gxj2YeTNA4OF1-4)
- [Heading Text](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=195-2506&t=Tq7Gxj2YeTNA4OF1-4)
- [Button](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=18-111&t=Tq7Gxj2YeTNA4OF1-4)
- [Card](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=69-1055&t=Tq7Gxj2YeTNA4OF1-4)
- [Input Field](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype?node-id=2096-1414&t=Tq7Gxj2YeTNA4OF1-4)

### Code Block Specifics
- General Code Color            [#FFFFFF]
- Include and Attribute Color   [#569CD6]
- Object Color                  [#4EC9B0]
- String Color                  [#D69D85]
- Number Color                  [#B5CEA8]
- Struct Color                  [#C0D088]
- Code Function Color           [#DCDCAA]
- Code Comment Color            [#57A64A]