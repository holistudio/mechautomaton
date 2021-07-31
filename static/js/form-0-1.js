let form0;
let form1;

let form0CurvePoints;
let f1;
let form1CurvePoints;
let f2;
let formCurvePoints;

let timeFraction=0;

let printOnce = true;
let p = 0;


//TODO: Consider reading csv files using the code below instead
// TODO: see if this prevents timing issues, as p5 may have cause threejs loops to run faster?

// var obj_csv = {
//     size:0,
//     dataFile:[]
// };
 
// function readImage(input) {
//     console.log(input)
//  if (input.files && input.files[0]) {
//  let reader = new FileReader();
//         reader.readAsBinaryString(input.files[0]);
//  reader.onload = function (e) {
//  console.log(e);
//  obj_csv.size = e.total;
//  obj_csv.dataFile = e.target.result
//             console.log(obj_csv.dataFile)
//             parseData(obj_csv.dataFile)
            
//  }
//  }
// }
 
// function parseData(data){
//     let csvData = [];
//     let lbreak = data.split("\n");
//     lbreak.forEach(res => {
//         csvData.push(res.split(","));
//     });
//     console.table(csvData);
// }
function loadPoints(table){
    let formPoints =  [];
    // let curve = {id:0,points:[]};
    // let curvePoint = {x:0,y:0,z:0};
    let curveKey = -1;
    let xCoord = -1;

    //store table/CSV to 2D array or something
    // console.log(table.getRowCount());
    //each row
    for(let i = 0; i<table.getRowCount();i++){
        let row = table.getRow(i);
        
        //if xCoord changed, add a new curveKey and empty array of points
        if(xCoord != row.get(0))
        {
            
            curveKey = curveKey+1;
            let curve = {id:curveKey,points:[]};
            xCoord = row.get(0);
            formPoints.push(curve);
            // console.log(formPoints[curveKey]);
        }

        //append latest point to formPoints at the latest curveKey
        formPoints[curveKey].points.push({x:1*row.get(0),y:1*row.get(2),z:-1*row.get(1)});

    }
    
    return formPoints;
}

function preload(){
    //load points from CSV files
    form0 = loadTable('static/forms/form_0.csv');
    form1 = loadTable('static/forms/form_1.csv');
}

function main() {
    

    //RENDERER
    const canvas = document.querySelector('#c'); //make sure canvas is defined before this script
    const renderer = new THREE.WebGLRenderer({canvas}); //sets renderer's DOM element
    renderer.setClearColor(0x8f8f8f);
    
    //TODO: Set camera to perspective matching Rhino
    //Lens length = 50 ...?
    //Position = 3282, 2530, 1125
    //NOTE: Above should already be converted
    //Lookat (1148,-66,-678)

    //CAMERA
    const fov = 40;
    const aspect = 2;  // the canvas default
    const near = 1;
    const far = 10000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // camera.position.x = 3282;
    // camera.position.y = 2530;
    // camera.position.z = 1125;
    camera.position.set(3808, 2007, 1048);
    camera.lookAt(1053,-2,-660);

    //SCENE
    const scene = new THREE.Scene();

    //LIGHTS
    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        const helper = new THREE.DirectionalLightHelper( light, 5 );
        scene.add( helper );
        light.position.set(-1, 10, 4);
        scene.add(light);
    }
    
    //POINTS
    function makeSphere(position) {
        const radius = 4;
        const widthSegments = 12;
        const heightSegments = 8;
        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
        const color = 0x49ef4;
        const material = new THREE.MeshPhongMaterial({color});

        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        sphere.position.x = position.x;
        sphere.position.y = position.y;
        sphere.position.z = position.z;

        return sphere;
    }
    // TODO: turn this to makeTriangle!
    //SURFACES
    function makePlane(p1,p2,p3,p4) {
        // const color = 0x42f5a1;
        const geometry = new THREE.BufferGeometry();
        // create a simple square shape. We duplicate the top left and bottom right
        // vertices because each vertex needs to appear once per triangle.
        const vertices = new Float32Array( [
            p1.x, p1.y, p1.z,
            p3.x, p3.y, p3.z,
            p2.x, p2.y, p2.z,

            p3.x, p3.y, p3.z,
            p1.x, p1.y, p1.z,
            p4.x, p4.y, p4.z,
        ] );

        // TODO: Calculate normal vectors for each triangle vertex
        // A = [a1, a2, a3] and B = [b1, b2, b3] 
        // cross(A,B) = [ a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1 ]
        // const normals = new Float32Array( [
        //     p1.x, p1.y, p1.z,
        // ] );
        // itemSize = 3 because there are 3 values (components) per vertex
        geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

        // geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
        
        const material = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
        // const material = new THREE.MeshNormalMaterial();
        const mesh = new THREE.Mesh( geometry, material );
        scene.add(mesh);

        return mesh;
    }

    // TODO: Maybe the entire mesh can be one BufferGeometry...and you'll interpolate accordingly...somehow
    // Reference: https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_indexed.html
    // See how it pushes vertices and normals to a single array before creating the geometry.
    // Maybe this is slower for interpolation, since you'll need to recalculate all vertices and then reinstantiate an entire geometry for the animation...

    // const pos = {x:0,y:0,z:0};
    // makeSphere(pos);
    
    // const radius = 7;
    // const widthSegments = 12;
    // const heightSegments = 8;
    // const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    // const color = 0x49ef4;
    // const material2 = new THREE.MeshPhongMaterial({color});
    // console.log('purple?')
    // const ball = new THREE.Mesh(geometry, material2);
    // scene.add(ball);

    
    //for each point in formPoints create a sphere
    const spheres = [];
    // console.log(form0CurvePoints[0]);
    form0CurvePoints.forEach(function(curve, index, array) {
        
        curve.points.forEach(function(coord, index, array) {
            // console.log(coord);
            spheres.push(makeSphere(coord));
            // makeSphere(coord);
        });
    });

    const surfaces = [];
    for (let i = 0; i < form0CurvePoints.length-1; i++) {
        const curve0 = form0CurvePoints[i];
        const curve1 = form0CurvePoints[i+1];
        for (let j = 0; j < curve0.points.length-1; j++) {
            const p1 = curve0.points[j];
            const p2 = curve1.points[j];
            const p3 = curve1.points[j+1];
            const p4 = curve0.points[j+1];


            // console.log(p1);
            surfaces.push(makePlane(p1,p2,p3,p4));
        }
        
    }



    //canvas' "external resolution" / size on the webpage is set by CSS
    //this function sets the canvas' "internal resolution"
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false); //sets size of renderer / canvas' drawingbuffer size / canvas's "internal resolution"
                                            //IMPORTANT: false tells setSize() to set the internal resolution and NOT CSS
        }
        return needResize; //used for updating other thing if canvas is resized
    }
    
    //RENDER LOOP
    const animationLoopTime = 5*72;

    function render(time) {
        time *= 0.001;  // convert time to seconds
        // console.log(time)
        timeFraction = 0;
        // timeFraction = time/animationLoopTime;
        // if(timeFraction > 1){
        //     timeFraction = 1;
        // }
        // console.log(timeFraction)

        // check if renderer resolution needs to change based on canvas/window size
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        // update camera aspect ratio to the canvas' aspect ratio
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        

        //TODO: interpolate between curves
        
        // console.log(timeFraction)
        formCurvePoints.forEach(function(curve, j, array) {
            let f1 = form0CurvePoints[j].points;
            let f2 = form1CurvePoints[j].points;
            // if(printOnce)
            // {
            //     console.log(f2);
                
            //     p++;
            //     if(p>2)
            //     {
            //         printOnce = false;
            //     }
            // }
            
            curve.points.forEach(function(coord, k, array) {
                sphereIndex = f1.length * j + k;
                // console.log(timeFraction);
                // if(timeFraction>=1){
                //     print("Done!");
                // }
                coord.x = 1*f1[k].x + timeFraction*(f2[k].x-f1[k].x);
                coord.y = 1*f1[k].y + timeFraction*(f2[k].y-f1[k].y);
                coord.z = 1*f1[k].z + timeFraction*(f2[k].z-f1[k].z);
                // if(i == 0 & j == 0){
                //     print(`${b[j].z-a[j].z}`);
                // }
                // if(printOnce){
                //     if(coord.z >= f2[k].z){
                //         // print(time);
                //         printOnce = false;
                //     }
                // }
                
                spheres[sphereIndex].position.x = coord.x;
                spheres[sphereIndex].position.y = coord.y;
                spheres[sphereIndex].position.z = coord.z;
            });

        });

        // for(let i = 0; i<formCurvePoints.length; i++){
        //     let f1 = form0CurvePoints[i].points;

        //     let f2 = form1CurvePoints[i].points;
        //     for(let j = 0; j<f1.length; j++){
        //         sphereIndex = f1.length * i + j;
        //         // console.log(timeFraction);
        //         // if(timeFraction>=1){
        //         //     print("Done!");
        //         // }
        //         coord = form0CurvePoints[i].points[j];
        //         coord.x = 1*f1[j].x + timeFraction*(f2[j].x-f1[j].x);
        //         coord.y = 1*f1[j].y + timeFraction*(f2[j].y-f1[j].y);
        //         coord.z = 1*f1[j].z + timeFraction*(f2[j].z-f1[j].z);
        //         // if(i == 0 & j == 0){
        //         //     print(`${b[j].z-a[j].z}`);
        //         // }
                
        //         spheres[sphereIndex].position.x = coord.x;
        //         spheres[sphereIndex].position.y = coord.y;
        //         spheres[sphereIndex].position.z = coord.z;

        //     }
        // }

        //TODO: set sphere positions based on interpolations


        renderer.render(scene, camera);
        
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function setup(){
    form0CurvePoints = loadPoints(form0);
    console.log(form0CurvePoints);
    form1CurvePoints = loadPoints(form1);
    console.log(form1CurvePoints);
    formCurvePoints = form0CurvePoints;

    main();
}


