# Signal Bloom

# Futuristic Cinematic Portfolio Animation Prompt

Create a highly immersive, cinematic portfolio website inspired by **experimental film studios, retro-futurism, CRT television aesthetics, and modern interactive award-winning websites**.

The website should NOT feel like a conventional portfolio. It should feel like the user is entering an interactive visual experience.

## Overall Visual Direction

Use a **dark cinematic environment** as the foundation:

* Almost-black background: `#050505` / `#080808`
* Deep charcoal and muted gray surfaces
* Subtle warm red/orange atmospheric lighting
* Occasional pale cyan / mint UI accents
* High contrast typography
* Soft film grain
* Subtle chromatic aberration
* CRT scanlines and screen distortion
* Slight VHS/static artifacts
* Atmospheric bloom and glow
* Very subtle vignette around the viewport

The aesthetic should feel like:

**"A futuristic creative studio discovered inside an old television broadcast."**

Avoid making it look like a generic neon cyberpunk website. Keep it sophisticated, cinematic, minimal, and editorial.

---

# HERO SECTION

The hero should open with a dark room containing several **floating/stacked vintage CRT televisions**.

Each television should have:

* Thick old-school CRT casing
* Rounded screen corners
* Slightly different sizes
* Slight rotations
* Different depths in 3D space
* Soft realistic shadows
* Screen glow
* Subtle reflections
* Static/noise on some screens
* Abstract imagery or distorted video playing on others

The TVs should appear to exist inside a dark 3D environment rather than simply being flat images.

### Camera

Use a virtual 3D camera.

The camera should slowly move through the television environment.

At the beginning:

* Camera is relatively close to the TVs
* Some TVs are partially outside the viewport
* Foreground objects are slightly blurred
* Background TVs are darker and less visible

As the user scrolls:

* Camera slowly moves forward
* Camera slightly rotates
* TVs pass by the camera
* Depth and parallax should be clearly visible
* Objects closer to the camera move faster than distant objects

The movement should be smooth and cinematic.

Do NOT make the camera movement linear.

Use easing such as:

`power2.inOut`
`power3.out`
`expo.out`

with subtle interpolation.

---

# HERO TYPOGRAPHY

Place large editorial typography over the environment.

Example:

"WE MAKE THE PAST
FEEL NEW"

The typography should be:

* Tall condensed sans-serif
* Large
* Uppercase
* Thin/medium weight
* Slightly transparent
* Pale gray/cyan
* Centered or slightly offset

The text should initially appear subtly and then become more visible as the camera settles.

Use a slight blur-to-sharp animation.

Example animation:

1. Text begins blurred
2. Opacity increases
3. Blur decreases
4. Letters slightly move into position
5. Text becomes sharp

Do NOT use a basic fade-in.

---

# SCROLL-BASED HERO TRANSITION

The entire hero should respond to scrolling.

As the user scrolls:

1. Camera moves forward through the TV environment
2. TVs move past the camera
3. Hero typography scales slightly
4. Background lighting changes
5. Red atmospheric light gradually becomes stronger
6. CRT screens flicker subtly
7. Some TVs disappear behind the camera
8. The next section gradually emerges

The transition should feel like one continuous camera shot.

There should NOT be a hard page transition.

---

# GIANT TYPOGRAPHY TRANSITION

At certain points during scrolling, introduce extremely large typography.

For example:

"ORIGINAL IN THE NOISE,
TUNED ONLY FOR..."

The letters should be enormous and partially extend outside the viewport.

Animate the typography horizontally or vertically based on scroll.

The text can initially be:

* oversized
* partially outside the screen
* slightly blurred

Then move into position as the user scrolls.

Use subtle letter-spacing animation.

The typography should feel like an editorial magazine / film title sequence.

---

# CASE STUDIES / WORK SECTION

Transition from the abstract environment into a section titled:

"OUR CASES"

Show creative projects as large cinematic CRT screens.

Each project should appear inside a large vintage television.

Example structure:

```
    [ PREVIOUS ]

          ┌───────────────┐
          │               │
          │   CRT SCREEN  │
          │   PROJECT     │
          │               │
          └───────────────┘

    Project Title

    [ EXPLORE → ]
```

The main project should be large and centered.

Additional projects should partially appear at the edges of the viewport.

This creates the feeling that there are more projects waiting outside the current viewport.

---

# PROJECT CARD ANIMATION

When switching between projects:

DO NOT simply replace the image.

Instead:

1. Current CRT slowly moves away
2. New CRT enters from the side
3. Camera slightly shifts toward the new CRT
4. Screen flickers
5. Image briefly becomes distorted
6. Static/noise appears
7. New image stabilizes
8. Project title fades/slides into place

Add a tiny glitch during the transition.

The transition should take approximately:

`700ms – 1200ms`

depending on scroll velocity.

---

# CRT GLITCH EFFECT

Create a subtle CRT/VHS effect.

Effects can include:

* Horizontal scanlines
* RGB separation
* Screen curvature
* Slight image displacement
* Random static
* Brightness flicker
* Horizontal tearing
* Small pixel blocks
* Occasional white noise
* Subtle screen bloom

IMPORTANT:

The glitch must remain subtle.

Do NOT turn the entire website into a constantly distorted glitch animation.

The effect should appear mainly during:

* Project transitions
* Scroll transitions
* Hover interactions
* Initial page load

---

# RED ATMOSPHERIC LIGHT

Add a large, extremely soft red/orange light source behind the content.

It should behave like atmospheric lighting rather than a visible gradient.

The light should:

* Slowly move
* Change intensity according to scroll
* Create a subtle red glow behind objects
* Affect the environment
* Become stronger during transitions
* Never overpower the content

Use a large blurred radial light / volumetric effect.

The red glow should feel like light coming from somewhere outside the scene.

---

# TEAM SECTION

Create a section titled:

"MEET OUR TEAM"

Place several portrait cards horizontally.

Each person should appear inside a dark cinematic portrait frame.

The cards should initially be slightly separated.

When the user scrolls:

* Cards move horizontally
* The center card becomes dominant
* Side cards become slightly darker
* Center card scales up slightly
* Portrait lighting becomes brighter
* Name and role appear underneath

Use subtle 3D perspective.

Example:

Side card:

`scale: 0.85`
`opacity: 0.55`

Center card:

`scale: 1`
`opacity: 1`

Do not make this feel like a standard carousel.

It should feel like a cinematic sequence of character introductions.

---

# ABOUT SECTION

Transition into a much quieter section.

Remove most of the visual noise.

Use:

* Almost completely black background
* Large typography
* Minimal animation
* Lots of empty space

Example:

"WE ARE A BUNCH OF PEOPLE
WHO MAKE IDEAS
FEEL ALIVE."

The heading should appear gradually as the user scrolls.

Some words can move independently.

Use a subtle horizontal displacement and blur effect.

---

# SCROLL PHYSICS

The website should feel physically connected to the scroll.

Use:

* Smooth scrolling
* Scroll velocity detection
* Scroll-linked transforms
* Parallax
* 3D depth
* Inertia
* Momentum
* Velocity-based rotation

Objects should respond slightly differently depending on scroll speed.

For example:

Normal scrolling:

* smooth movement

Fast scrolling:

* slightly stronger motion blur
* stronger object displacement
* more pronounced camera movement

Slow scrolling:

* calm cinematic movement

Never make the animation feel jittery.

---

# MOUSE INTERACTION

Add subtle mouse interaction to the 3D environment.

When the mouse moves:

* Camera moves slightly
* CRT objects shift subtly
* Background light follows the cursor
* Perspective changes slightly

Maximum movement should be very small.

Example:

`±3° camera rotation`

and

`10–20px parallax`

Do NOT make the entire page move aggressively with the cursor.

---

# HOVER INTERACTIONS

Interactive elements should feel tactile.

For CRT screens:

On hover:

* Screen brightness increases slightly
* Screen glow increases
* Image subtly zooms
* CRT distortion increases slightly
* Cursor changes
* Small text label appears

For buttons:

Use a minimal pale mint/cyan button.

On hover:

* background expands slightly
* text moves 2–4px
* subtle glow appears
* cursor interaction feels responsive

Avoid generic CSS button animations.

---

# PAGE TRANSITIONS

Every major section should feel connected.

Avoid:

`section 1 → hard cut → section 2`

Instead:

`section 1 → camera movement → typography → environment transition → section 2`

The entire website should feel like one continuous film.

Use scroll-triggered timelines to coordinate:

* camera
* lighting
* typography
* images
* 3D objects
* background
* distortion

---

# TECHNOLOGY

Prefer:

* React / Next.js
* Three.js
* React Three Fiber
* @react-three/drei
* GSAP
* ScrollTrigger
* Lenis for smooth scrolling
* CSS shaders / GLSL where useful

Use Three.js for the actual 3D environment.

Use GSAP ScrollTrigger for timeline synchronization.

Use CSS/GLSL for CRT distortion, scanlines, grain, and chromatic aberration.

Do NOT use hundreds of DOM elements to fake the 3D environment.

---

# PERFORMANCE

Even though the website is visually complex, it must remain performant.

Requirements:

* Lazy-load heavy assets
* Compress textures
* Use WebP/AVIF where possible
* Limit real-time post-processing
* Use instancing where appropriate
* Avoid unnecessarily high polygon counts
* Respect device pixel ratio
* Reduce effects on mobile devices
* Pause expensive animations when sections are not visible

Provide a simplified mobile version.

On mobile:

* Reduce the number of CRT objects
* Reduce 3D depth
* Reduce post-processing
* Keep the cinematic atmosphere
* Preserve the major animations

---

# IMPORTANT ANIMATION PRINCIPLE

The animation should NEVER feel like:

"elements appearing because a developer added fade-in animations."

Instead it should feel like:

**a camera is physically travelling through a strange cinematic world.**

Everything should have:

* depth
* weight
* inertia
* lighting
* perspective
* spatial relationship

The user should feel like they are controlling a camera through an interactive film.

---

# FINAL ART DIRECTION

The final result should feel like a combination of:

* experimental film website
* futuristic creative agency
* retro CRT television
* VHS aesthetics
* cinematic 3D environment
* editorial typography
* interactive art installation

Overall mood:

**Dark. Mysterious. Cinematic. Futuristic. Experimental. Premium.**

Avoid:

* generic glassmorphism
* excessive neon
* generic gradients
* basic fade-in animations
* standard card layouts
* excessive rounded cards
* excessive shadows
* overly colorful UI
* template-looking portfolio designs

The website should look like something designed for an **Awwwards / FWA-style creative showcase**, not a conventional developer portfolio.

## Most Important Requirement

Prioritize the **animation choreography and camera movement** over adding lots of UI elements.

If you have to choose between:

**more features** vs **better animation**

choose **better animation**.

The experience should feel intentional, smooth, cinematic, and slightly surreal.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
