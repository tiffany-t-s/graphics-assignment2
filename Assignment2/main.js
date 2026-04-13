import { default as gulls } from './gulls.js'
import { default as Video } from './video.js'
import { default as Mouse } from './mouse.js'
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.1/dist/tweakpane.min.js';

// a simple vertex shader to make a quad
const quadVertexShader = gulls.constants.vertex,
// our fragment shader, just returns blue
      fragmentShader = await gulls.import('./frag.wgsl'),
// our vertex + fragment shader together
      shader = quadVertexShader + fragmentShader,
// start seagulls, by default it will use the first <canvas> element it
// finds in your HTML page
      sg = await gulls.init();

await Video.init();
Mouse.init();

const mouse_uni = sg.uniform([0, 0, 0]);

//TweakPane
const pane = new Pane();
const PARAMS = { spotlight: 0.25, grids: 5.0, feedback: .5, speed: 500., tint: {}};

const radius = sg.uniform(PARAMS.spotlight),
      grid = sg.uniform(PARAMS.grids),
      intensity = sg.uniform(PARAMS.feedback),
      velocity = sg.uniform(PARAMS.speed),
      color = sg.uniform(Object.values(PARAMS.tint))
//Change size of "spotlight"
pane.addBinding(PARAMS, 'spotlight', {min: 0.05, max: 0.29, step: .02, format: (v) => v.toFixed(2)}) 
//Affect the intensity of the foreground
pane.addBinding(PARAMS, 'grids', {min: 0.5, max: 15.0, step: 0.1, format: (v) => v.toFixed(2)}) 
//Change feedback effect of the background
pane.addBinding(PARAMS, 'feedback', {min: 0.1, max: 1.5, step: 0.1, format: (v) => v.toFixed(2)}) 
//Want to affect the speed of the foreground ()
pane.addBinding(PARAMS, 'speed', {min: 10, max: 900, step: 100, format: (v) => v.toFixed(2)})
pane.on('change', evt => {
      radius.value = PARAMS.spotlight,
      grid.value = PARAMS.grids,
      intensity.value = PARAMS.feedback,
      velocity.value = PARAMS.speed
    })
    
pane.refresh();
// create a render pass
const res = sg.uniform([window.innerWidth, window.innerHeight]),
      back = new Float32Array( gulls.width * gulls.height * 5 ),
      feedback_t = sg.texture( back ); 

let frame = sg.uniform( 0 ),
    time = sg.uniform( 0 );

const renderPass = await sg.render({ 
  shader,
  data:[
    res,
    frame,
    mouse_uni,
    sg.sampler(),
    feedback_t,
    time,
    radius,
    grid,
    intensity,
    velocity,
    sg.video( Video.element)
  ] ,
  onframe() { frame.value++, mouse_uni.value = Mouse.values, time.value = (performance.now())},
  copy: feedback_t
});

// run our render pass
sg.run( renderPass );

