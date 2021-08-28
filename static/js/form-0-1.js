let form0;
let form1;

let form0CurvePoints;
let f1;
let form1CurvePoints;
let f2;
let formCurvePoints;

let timeFraction;
let startTime = 0;
let printOnce = true;
let p = 0;

let mesh, geometry;
let vertices = [];
let normals = [];


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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
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
    
    camera.position.set(3808, 3007, 548);
    camera.lookAt(1053,-2,-660);
    
    // camera.position.set(3808, 2007, -1048);
    // camera.lookAt(0,-2,-660);

    // camera.position.set(-1023, 2804, -2669);
    // camera.lookAt(939, 237, -643);

    // camera.position.set(4429,1502,-1299);
    // camera.lookAt(1668,319,-574);

    // camera.position.set(3540,1213,-1095);
    // camera.lookAt(1368,407,396);

    // camera.position.set(-257,161,-266);
    // camera.lookAt(1380,273,-317);
    

    //SCENE
    const scene = new THREE.Scene();

    //LIGHTS
    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        
        light.position.set(-1000,1000,1000);
        // light.castShadow = true;
        scene.add(light);

        // light.shadow.mapSize.width = 1024; // default
        // light.shadow.mapSize.height = 1024; // default
        // light.shadow.camera.near = 1; // default
        // light.shadow.camera.far = 10000; // default

        const helper = new THREE.DirectionalLightHelper( light, 5 );
        // scene.add( helper );

        const pointLight = new THREE.PointLight(color, 0.5, 0 );
        
        pointLight.position.set( 1500, 1000, -3000 );
        const pointLightHelper = new THREE.PointLightHelper( pointLight, 5 );
        scene.add( pointLight );
        scene.add( pointLightHelper );
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

    //SURFACES
    geometry = new THREE.BufferGeometry();
    const meshMaterial = new THREE.MeshLambertMaterial( {color: 0x32fcdb, side: THREE.DoubleSide} );

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

    function makeFace(p1,p2,p3) {
        // const color = 0x42f5a1;
        // create a simple square shape. We duplicate the top left and bottom right
        // vertices because each vertex needs to appear once per triangle.
        vertices.push(p1.x, p1.y, p1.z);
        vertices.push(p2.x, p2.y, p2.z);
        vertices.push(p3.x, p3.y, p3.z);

        // TODO: Calculate normal vectors for each triangle vertex
        // A = [a1, a2, a3] and B = [b1, b2, b3] 
        const a1 = p3.x - p2.x;
        const a2 = p3.y - p2.y;
        const a3 = p3.z - p2.z;

        const b1 = p1.x - p2.x;
        const b2 = p1.y - p2.y;
        const b3 = p1.z - p2.z;

        // cross(A,B) = [ a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1 ]
        const crossAB = {x:a2 * b3 - a3 * b2, y:a3 * b1 - a1 * b3, z:a1 * b2 - a2 * b1};
        
        normals.push(crossAB.x, crossAB.y, crossAB.z);
        normals.push(crossAB.x, crossAB.y, crossAB.z);
        normals.push(crossAB.x, crossAB.y, crossAB.z);
    }

    function updateFace(i,p1,p2,p3) {
        const position = geometry.attributes.position;
        const dir = geometry.attributes.normal;
        // const color = 0x42f5a1;
        // create a simple square shape. We duplicate the top left and bottom right
        // vertices because each vertex needs to appear once per triangle.
        // vertices[i]=p1.x;
        // vertices[i+1]=p1.y;
        // vertices[i+2]=p1.z;
        // vertices[i+3]=p2.x;
        // vertices[i+4]=p2.y;
        // vertices[i+5]=p2.z;
        // vertices[i+6]=p3.x;
        // vertices[i+7]=p3.y;
        // vertices[i+8]=p3.z;

        position.setX(i, p1.x);
        position.setY(i, p1.y);
        position.setZ(i, p1.z);
        position.setX(i+1, p2.x);
        position.setY(i+1, p2.y);
        position.setZ(i+1, p2.z);
        position.setX(i+2, p3.x);
        position.setY(i+2, p3.y);
        position.setZ(i+2, p3.z);

        // TODO: Calculate normal vectors for each triangle vertex
        // A = [a1, a2, a3] and B = [b1, b2, b3] 
        const a1 = p3.x - p2.x;
        const a2 = p3.y - p2.y;
        const a3 = p3.z - p2.z;

        const b1 = p1.x - p2.x;
        const b2 = p1.y - p2.y;
        const b3 = p1.z - p2.z;

        // cross(A,B) = [ a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1 ]
        const crossAB = {x:a2 * b3 - a3 * b2, y:a3 * b1 - a1 * b3, z:a1 * b2 - a2 * b1};

        dir.setX(i, crossAB.x);
        dir.setY(i, crossAB.y);
        dir.setZ(i, crossAB.z);
        dir.setX(i+1, crossAB.x);
        dir.setY(i+1, crossAB.y);
        dir.setZ(i+1, crossAB.z);
        dir.setX(i+2, crossAB.x);
        dir.setY(i+2, crossAB.y);
        dir.setZ(i+2, crossAB.z);
    }

    function makeQuad(p1,p2,p3,p4) {
        // const color = 0x42f5a1;
        // create a simple square shape. We duplicate the top left and bottom right
        // vertices because each vertex needs to appear once per triangle.
        vertices.push(p1.x, p1.y, p1.z);
        vertices.push(p3.x, p3.y, p3.z);
        vertices.push(p2.x, p2.y, p2.z);
        vertices.push(p3.x, p3.y, p3.z);
        vertices.push(p1.x, p1.y, p1.z);
        vertices.push(p4.x, p4.y, p4.z);

        // TODO: Calculate normal vectors for each triangle vertex
        // A = [a1, a2, a3] and B = [b1, b2, b3] 
        const a1 = p2.x - p1.x;
        const a2 = p2.y - p1.y;
        const a3 = p2.z - p1.z;

        const b1 = p2.x - p3.x;
        const b2 = p2.y - p3.y;
        const b3 = p2.z - p3.z;

        // cross(A,B) = [ a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1 ]
        const crossAB = {x:a2 * b3 - a3 * b2, y:a3 * b1 - a1 * b3, z:a1 * b2 - a2 * b1};
        
        normals.push(crossAB.x, crossAB.y, crossAB.z);
        normals.push(crossAB.x, crossAB.y, crossAB.z);
        normals.push(crossAB.x, crossAB.y, crossAB.z);
        normals.push(crossAB.x, crossAB.y, crossAB.z);
        normals.push(crossAB.x, crossAB.y, crossAB.z);
        normals.push(crossAB.x, crossAB.y, crossAB.z);
    }

    function updateQuad(i,p1,p2,p3,p4) {
        const position = geometry.attributes.position;
        const dir = geometry.attributes.normal;
        // const color = 0x42f5a1;
        // create a simple square shape. We duplicate the top left and bottom right
        // vertices because each vertex needs to appear once per triangle.
        // vertices[i]=p1.x;
        // vertices[i+1]=p1.y;
        // vertices[i+2]=p1.z;
        // vertices[i+3]=p2.x;
        // vertices[i+4]=p2.y;
        // vertices[i+5]=p2.z;
        // vertices[i+6]=p3.x;
        // vertices[i+7]=p3.y;
        // vertices[i+8]=p3.z;

        position.setX(i, p1.x);
        position.setY(i, p1.y);
        position.setZ(i, p1.z);

        position.setX(i+1, p3.x);
        position.setY(i+1, p3.y);
        position.setZ(i+1, p3.z);

        position.setX(i+2, p2.x);
        position.setY(i+2, p2.y);
        position.setZ(i+2, p2.z);

        position.setX(i+3, p3.x);
        position.setY(i+3, p3.y);
        position.setZ(i+3, p3.z);

        position.setX(i+4, p1.x);
        position.setY(i+4, p1.y);
        position.setZ(i+4, p1.z);
        
        position.setX(i+5, p4.x);
        position.setY(i+5, p4.y);
        position.setZ(i+5, p4.z);

        // TODO: Calculate normal vectors for each triangle vertex
        // A = [a1, a2, a3] and B = [b1, b2, b3] 
        const a1 = p2.x - p1.x;
        const a2 = p2.y - p1.y;
        const a3 = p2.z - p1.z;

        const b1 = p2.x - p3.x;
        const b2 = p2.y - p3.y;
        const b3 = p2.z - p3.z;

        // cross(A,B) = [ a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1 ]
        const crossAB = {x:a2 * b3 - a3 * b2, y:a3 * b1 - a1 * b3, z:a1 * b2 - a2 * b1};

        dir.setX(i, crossAB.x);
        dir.setY(i, crossAB.y);
        dir.setZ(i, crossAB.z);

        dir.setX(i+1, crossAB.x);
        dir.setY(i+1, crossAB.y);
        dir.setZ(i+1, crossAB.z);

        dir.setX(i+2, crossAB.x);
        dir.setY(i+2, crossAB.y);
        dir.setZ(i+2, crossAB.z);

        dir.setX(i+3, crossAB.x);
        dir.setY(i+3, crossAB.y);
        dir.setZ(i+3, crossAB.z);

        dir.setX(i+4, crossAB.x);
        dir.setY(i+4, crossAB.y);
        dir.setZ(i+4, crossAB.z);

        dir.setX(i+5, crossAB.x);
        dir.setY(i+5, crossAB.y);
        dir.setZ(i+5, crossAB.z);
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
    // const spheres = [];
    // // console.log(form0CurvePoints[0]);
    // form0CurvePoints.forEach(function(curve, index, array) {
        
    //     curve.points.forEach(function(coord, index, array) {
    //         // console.log(coord);
    //         spheres.push(makeSphere(coord));
    //         // makeSphere(coord);
    //     });
    // });

    // const surfaces = [];
    for (let i = 0; i < formCurvePoints.length-1; i++) {
        const curve0 = formCurvePoints[i];
        const curve1 = formCurvePoints[i+1];
        
        for (let j = 0; j < curve0.points.length; j++) {
            let p1,p2,p3,p4;
            if(j==curve0.points.length-1){
                p1 = curve0.points[j];
                p2 = curve1.points[j];
                p3 = curve1.points[0];
                p4 = curve0.points[0];
            }
            else{
                p1 = curve0.points[j];
                p2 = curve1.points[j];
                p3 = curve1.points[j+1];
                p4 = curve0.points[j+1];
            }
            
            // console.log(p1);
            // makeFace(p1,p3,p2);
            // makeFace(p3,p1,p4);
            makeQuad(p1,p2,p3,p4);
        }
        
    }

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
    
    
    // const material = new THREE.MeshNormalMaterial();
    mesh = new THREE.Mesh( geometry, meshMaterial );
    // mesh.castShadow = true;
    // mesh.receiveShadow = true;
    scene.add(mesh);


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
    const animationLoopTime = 5;
    let reverse = false;
    
    function render(time) {
        // const time = Date.now() * 0.001;
        time = time * 0.001;

        // console.log(time-startTime)
        if((time-startTime) > animationLoopTime){
            
            reverse = !reverse;
            startTime = time;
        }
        delta = (time-startTime);

        

        if(reverse){
            timeFraction = (animationLoopTime-delta)/animationLoopTime;
        }
        else{
            timeFraction = delta/animationLoopTime;
        }

        

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
            
            //update curve points interpolating between form0 and form1
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
                
                // spheres[sphereIndex].position.x = coord.x;
                // spheres[sphereIndex].position.y = coord.y;
                // spheres[sphereIndex].position.z = coord.z;
            });

        });

        let geoIndex=0;
        for (let i = 0; i < formCurvePoints.length-1; i++) {
            const curve0 = formCurvePoints[i];
            const curve1 = formCurvePoints[i+1];
            // let curve0, curve1;
            // if(i==formCurvePoints.length-1){
            //     curve0 = formCurvePoints[i];
            //     curve1 = formCurvePoints[0];
            // }
            // else{
            //     curve0 = formCurvePoints[i];
            //     curve1 = formCurvePoints[i+1];
            // }
            for (let j = 0; j < curve0.points.length; j++) {
                // const p1 = curve0.points[j];
                // const p2 = curve1.points[j];
                // const p3 = curve1.points[j+1];
                // const p4 = curve0.points[j+1];
                let p1,p2,p3,p4;
                if(j==curve0.points.length-1){
                    p1 = curve0.points[j];
                    p2 = curve1.points[j];
                    p3 = curve1.points[0];
                    p4 = curve0.points[0];
                }
                else{
                    p1 = curve0.points[j];
                    p2 = curve1.points[j];
                    p3 = curve1.points[j+1];
                    p4 = curve0.points[j+1];
                }
                // console.log(p1);
                // updateFace(geoIndex,p1,p3,p2);
                // geoIndex = geoIndex + 3;
                // updateFace(geoIndex,p3,p1,p4);
                // geoIndex = geoIndex + 3;

                updateQuad(geoIndex,p1,p2,p3,p4);
                geoIndex = geoIndex + 6;
            }
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.normal.needsUpdate = true;


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
    // console.log(form0CurvePoints);
    form1CurvePoints = loadPoints(form1);
    // console.log(form1CurvePoints);
    formCurvePoints = JSON.parse(JSON.stringify(form0CurvePoints));

    main();
}


