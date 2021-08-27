let form0;
let form1;

let form0CurvePoints;
let form1CurvePoints;
let formCurvePoints;

let timeFraction=0;

let printOnce = true;
let p = 0;

let mesh, geometry;
let vertices = [];
let normals = [];

let startTime = Date.now();

const animationLoopTime = 5;

let camera, scene, renderer;



function loadPoints(table){
    let formPoints =  [];

    let curveKey = -1;
    let xCoord = -1;

    //store table/CSV to 2D array or something
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

function init() {
    //RENDERER
    const canvas = document.querySelector('#c'); //make sure canvas is defined before this script
    renderer = new THREE.WebGLRenderer({canvas}); //sets renderer's DOM element
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
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(3808, 2007, 548);
    camera.lookAt(1053,-2,-660);

    //SCENE
    scene = new THREE.Scene();

    //LIGHTS
    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        
        light.position.set(1000,1000,1000);
        light.castShadow = true;
        scene.add(light);

        light.shadow.mapSize.width = 1024; // default
        light.shadow.mapSize.height = 1024; // default
        light.shadow.camera.near = 1; // default
        light.shadow.camera.far = 10000; // default

        const helper = new THREE.DirectionalLightHelper( light, 5 );

        const pointLight = new THREE.PointLight(color, intensity, 0 );
        
        pointLight.position.set( 1500, 1000, -3000 );
        const pointLightHelper = new THREE.PointLightHelper( pointLight, 5 );
        scene.add( pointLight );
    }
    
    //POINTS

    //SURFACES
    geometry = new THREE.BufferGeometry();
    const meshMaterial = new THREE.MeshLambertMaterial( {color: 0x32fcdb, side: THREE.DoubleSide} );

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
            makeQuad(p1,p2,p3,p4);
        }
        
    }

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
    
    
    // const material = new THREE.MeshNormalMaterial();
    mesh = new THREE.Mesh( geometry, meshMaterial );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

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

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
}


function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {

    function updateQuad(i,p1,p2,p3,p4) {
        const position = geometry.attributes.position;
        const dir = geometry.attributes.normal;

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

        // Calculate normal vectors for each triangle vertex
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

    const time = (Date.now() - startTime) * 0.001;

    timeFraction = time/animationLoopTime;
    // timeFraction = 0.25;

    // console.log(timeFraction);
    if(timeFraction > 1){
        startTime = Date.now();
        //console.log(time);
    }

    for (let i = 0; i < formCurvePoints.length; i++) {
        const f1 = form0CurvePoints[i].points;
        const f2 = form1CurvePoints[i].points;
        // console.log('here');
        //update curve points interpolating between form0 and form1
        for (let j = 0; j < formCurvePoints[i].points.length; j++) {
            // console.log('here');
            const coord = formCurvePoints[i].points[j];
            // console.log(timeFraction);
            
            if(i==0 && j==2){
                // console.log(f1[j].y);
            }


            coord.x = f1[j].x + timeFraction*(f2[j].x-f1[j].x);
            coord.y = f1[j].y + timeFraction*(f2[j].y-f1[j].y);
            coord.z = f1[j].z + timeFraction*(f2[j].z-f1[j].z);
            
            // coord.x = f2[j].x;
            // coord.y = f2[j].y;
            // coord.z = f2[j].z;
        }
        
    }

    let geoIndex=0;
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

            updateQuad(geoIndex,p1,p2,p3,p4);
            geoIndex = geoIndex + 6;
        }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.normal.needsUpdate = true;

    renderer.render(scene, camera);
    
}


function setup(){
    form0CurvePoints = loadPoints(form0);
    form1CurvePoints = loadPoints(form1);
    formCurvePoints = JSON.parse(JSON.stringify(form0CurvePoints));
    console.log(form0CurvePoints);
    // console.log(form1CurvePoints);
    console.log(formCurvePoints);

    

    init();
    animate();

}


