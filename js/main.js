import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';


class Spaceship{
	constructor(scene) {
		const modelLoader = new OBJLoader();
		const modelMaterial = new THREE.MeshBasicMaterial({color: 0xfff394});
		
		this.model = null;
        this.height = 0;
        this.width = 0;
		
		modelLoader.load(
			'assets/AirShip.obj', 
			(obj) => {
				obj.traverse((child)=>{
					child.material = modelMaterial;			
				});
				obj.rotation.x = -Math.PI / 2;
				obj.position.set(0,0,0);
				this.model = obj;
				this.model.scale.set(0.8,0.8,0.8);
				scene.add(this.model);

				
				const spaceshipBoundBox = new THREE.Box3().setFromObject(this.model);
				this.height = spaceshipBoundBox.getSize().y;
				this.width = spaceshipBoundBox.getSize().x; 
				
				}
		);
	}
	update = function() {
		if (this.model) {
		
		}
	}
	
	handleInput(keyMap, camera) {
        if (this.model) {
            // W
            if (keyMap[87] && (this.model.position.y + this.height / 2 <   30)) {
                this.model.position.y += 1
            }
            // S 
            if (keyMap[83] && (this.model.position.y - this.height / 2 > 0)) {
                this.model.position.y -= 1;
            }
            // D 
            if (keyMap[68] && (this.model.position.x + this.width / 2 < 25)) {
                this.model.position.x += 1;
            }
            // A 
            if (keyMap[65] && (this.model.position.x - this.width / 2 > -25)) {
                this.model.position.x -= 1;
            }
        }
    }

}

class Enemy{
	constructor(scene, x, y) {
		const modelLoader = new OBJLoader();
		const modelMaterial = new THREE.MeshBasicMaterial({color: 0xc795f5});
		
		this.model = null;
		this.originalX;
        this.originalY;
		
		modelLoader.load(
			'assets/spaceship.obj', 
			(obj) => {
				obj.traverse((child)=>{
						child.material = modelMaterial;			
				});
				obj.rotation.x = -Math.PI / 2;
				this.model = obj;
				this.model.position.set(x, y, 0);
						
				scene.add(this.model);
			}
				
		);
		
		this.originalX = x;
        this.originalY = y;

        this.movementDistance = 7;
        this.speed = 0.2;
        this.direction = 1;
	}
	update = function() {
		if (this.model) {
			
			this.model.position.x += this.speed * this.direction;

            if (Math.abs(this.model.position.x - this.originalX) >= this.movementDistance) {
          
                this.direction *= -1;
            }
			this.model.position.y -= this.speed;
			if(this.model.position.y <= -5){
				this.model.position.set(this.originalX, 55, 0);
			}
		}
	}

	
}
 
class Projectile {
    constructor(scene, x, y) {
        const geometry = new THREE.BoxGeometry(0.5, 2, 1); 
        const material = new THREE.MeshBasicMaterial({ color: 0xff8cf0}); 

        this.model = new THREE.Mesh(geometry, material);
        this.model.position.set(x, y, 0); 
		
        scene.add(this.model);
    }

    update = function () {
        if (this.model) {
            this.model.position.y += 4; 
        }
    }
}

	
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x2c1442);
	const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	const renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	
	
	const directionalLight = new THREE.DirectionalLight( 0xffffff, 2.0 );
	directionalLight.position.set (1,1,1);
	scene.add( directionalLight );
	//camera.position.set (0, 20, 60);	
	camera.position.set(0, -15, 25);  
	camera.lookAt(0, 25, 0);
	
	var dynamicSubjects = [];
	var enemyNum = 0;
	const spaceship  = new Spaceship(scene);
	dynamicSubjects.push(spaceship);
	const keyMap = {};
	var enemies = [];
	var projectiles = [];
	var score = 0;
	var health = 5;
	
	function bindEventListeners() {
		window.onkeydown = handleKeyDown;
		window.onkeyup = handleKeyUp;
	}
	
	function handleKeyDown(event) {
		const keyCode = event.which;
		keyMap[keyCode] = true;
	}

	function handleKeyUp(event) {
		const keyCode = event.which;
		keyMap[keyCode] = false;
	}
		
	function placeEnemies(scene, num) {
		const numRows = Math.ceil(num / 5); 
		const startX = -25; 
		const startY = 55; 
		const spacingX = 10; 
		const spacingY = 10;
		enemyNum += num;
		for (let row = 0; row < numRows; row++) {
			for (let col = 0; col < 5; col++) {
				if (num <= 0) break;
			
					 
				var x = startX + col * spacingX ;
				var y = startY - row * spacingY;
				const enemy = new Enemy(scene, x, y);
				if(row % 2 == 0) 
						enemy.direction = -1;
				
				dynamicSubjects.push(enemy);
				enemies.push(enemy);
				num--;
			}
			
		}
		
	}
	
	function checkCollision(){
		var i = enemies.length;
		while (i--) {
			var j = projectiles.length;
			while (j--) {
				if(projectiles[j].model.position.y > 80){
					scene.remove(projectiles[j].model);
					projectiles.splice(j, 1);
				}
				else if (isCollision(projectiles[j], enemies[i])) {
					scene.remove(enemies[i].model);
					enemies.splice(i, 1);
					enemyNum--;
					scene.remove(projectiles[j].model);
					score++;
					document.getElementById("scoreboard").innerHTML = "health: " + health + " score: " + score; 
           
					projectiles.splice(j, 1);
					
				} 
			}
			if (isCollision(spaceship, enemies[i])) {
				scene.remove(enemies[i].model);
				enemies.splice(i, 1);
				enemyNum--;
				health--;
				document.getElementById("scoreboard").innerHTML = "health: " + health + "   score: " + score; 
           
			}
		}
	}
		
	
	function isCollision(a, b) {
		const boxA = new THREE.Box3().setFromObject(a.model);
		const boxB = new THREE.Box3().setFromObject(b.model);

		return boxA.intersectsBox(boxB);
	}
	
	

	var animate = function () {
		
		if(health > 0){
			requestAnimationFrame( animate );
			dynamicSubjects.forEach(subject => subject.update());
			
			spaceship.handleInput(keyMap, camera);
			if(enemyNum  == 0 && score > 25)
				placeEnemies(scene, 20);
			else if(enemyNum  == 0)
				placeEnemies(scene, 15)
			if (keyMap[32]) {

					var x = spaceship.model.position.x;
					var y = spaceship.model.position.y + spaceship.height;

					const p = new Projectile(scene, x, y);

					dynamicSubjects.push(p);
					projectiles.push(p);
					keyMap[32] = false;
			   }
			checkCollision();
			renderer.render( scene, camera );
		}
		else
			document.getElementById("gameover").innerHTML = "game over"; 
			 
		
	};

	bindEventListeners();
	
	animate();