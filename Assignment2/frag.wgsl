@group(0) @binding(0) var<uniform> res : vec2f;
@group(0) @binding(1) var<uniform> frame : f32;
@group(0) @binding(2) var<uniform> mouse : vec3f;
@group(0) @binding(3) var backSampler:   sampler;
@group(0) @binding(4) var backBuffer:     texture_2d<f32>;
@group(0) @binding(5) var<uniform> time: f32;
@group(0) @binding(6) var<uniform> radius:  f32;
@group(0) @binding(7) var<uniform> grid:  f32;
@group(0) @binding(8) var<uniform> intensity:  f32;
@group(0) @binding(9) var<uniform> velocity: f32;

@group(1) @binding(0) var videoBuffer:    texture_external;

@fragment
    fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
    let random = fract(sin(dot(pos.xy, vec2(12.9898,78.233)))* 43758.5453123);
    var uv = pos.xy/res;

    //video stuff
    let video = textureSampleBaseClampToEdge( videoBuffer, backSampler, uv );
    //mouse stuff
    //Changes the size of the spotlight. Set bounds from .05 to .29
    let track = smoothstep(radius, min(time/10000., .3), distance(uv, mouse.xy));

    //feedback
    let fb = textureSample( backBuffer, backSampler, uv * -3. );

    //This affects the "intensity" (num of grids) of the foreground. Bigger num = more grids
    uv = uv * grid;

    //The time/500 affects the speed of the foreground. Bigger denominator = slower
    uv.x += sin(time/velocity - (step(1., (uv.y % 2.)) * .5))* 1.5 ;
    uv.y += cos(time/velocity + (step(1., (uv.x % 2.)) * .5))/ 3. ;
    uv = fract(uv);

    var grad = vec3((fract(uv)), 0.0);
    var color = vec4f(random, 0.0, 0.6, 0.3);
    color += smoothstep(.5, .9, random*uv.x);
    let color_grad = vec4f(vec4f(grad, .7) + color);

    //Affects the feedback effect of background where (fb * __)
    var out = (video * 1.2) + (fb * intensity);
    out.b = out.b + (sin(time/100.) * random * .4);
    out.r = out.r + (cos(time/100.) * random );
    let new_out = mix(out, color_grad/1.5, track);

    return new_out;
    //return vec4f(out);
    //return vec4f(new_out );
    }