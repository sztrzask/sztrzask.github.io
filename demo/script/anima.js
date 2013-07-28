function anima()
{
	var god = this,
		context,
		mouse = {
			x: -99999,
			y: -99999
		},
		isTouchingScreen = false,
		minForce = 0,
		maxForce = 500,
		time = +new Date().getTime(),
		FPS = 60,
		switchAudio = false,
		nodeIndex = 0,
		body = document.querySelector( 'body' );

	this.allowSwitchAudio = function ()
	{
		switchAudio = true;
	};
	this.nodeTree = [];
	this.addNode = function ( message, timeout, animation )
	{
		god.nodeTree.push(new node( message, timeout, animation ));
		return god;
	};
	var node = function ( message, timeout, animation )
	{
		return {
			message: message,
			timeout: timeout,
			animation: animation,
			then: function () { }
		};
	};

	this.then = function ( callback )
	{
		callback = callback || function ( god ) { };
		god.nodeTree[god.nodeTree.length - 1].then = callback;
		return god;
	};

	this.options = {
		particles: [],
		canvas: '',
		box: '',
		colors: [],
		audio: '',
		maxParticles: 100,
	};
	this.setMaxParticles = function ( max )
	{
		god.options.maxParticles = max;
		createParticles();
	};
	this.setSoundtrack = function ( name )
	{
		/// <summary>Set soundtrack from predefined list or by href</summary>
		/// <param name="name" type="String">Soundtrack to set. Provide valid src.</param>
		var audio = document.querySelector( 'audio' );
		if ( !audio )
		{
			audio = document.createElement( 'audio' );
			audio.removeAttribute( 'controls' );
			audio.loop = true;
			audio.volume = 0.5;
			body.appendChild( audio );
		}
		audio.src = name;
		god.options.audio = audio;

		return god;
	};
	this.playMusic = function ()
	{
		var audio = document.querySelector( 'audio' );
		audio.play();

		return god;
	};
	this.setParticleColors = function ( colors )
	{
		god.options.colors = colors;
		if ( god.options.particles.length )
		{
			for ( var i = 0; i < god.options.particles.length; i++ )
			{
				god.options.particles[i].color = god.options.colors[~~( Math.random() * god.options.colors.length )];
			}
		}
		return god;
	};
	this.setBackgroundColor = function ( from, to )
	{
		from = from || '#B1E5DF';
		to = to || '#68C0CC';
		god.options.canvas.width = window.innerWidth;
		god.options.canvas.height = window.innerHeight;
		var pref = ['', '-webkit-', '-moz-', '-ms-', '-o'];
		pref.forEach( function ( e, i )
		{
			god.options.canvas.style.background = e + 'radial-gradient(' + from + ', ' + to + ')';
		} );

		return god;
	};
	this.play = function ()
	{
		pulse();
		return god;
	};

	this.currentNode = null;

	this.updateBox = function ( message )
	{
		god.options.box.innerHTML = '<p><span>' + message + '</span></p>';
	};

	/*
	 * Utils
	 */

	function isModernEnough()
	{
		/// <summary>Checks if browser is modern enought to use 2d canvas. As far it's not IE8 or less, it's modern enough.</summary>
		return god.options.canvas.getContext && god.options.canvas.getContext( '2d' );
	}

	function abs( x )
	{
		var b = x >> 31;
		return ( x ^ b ) - b;
	}

	function applyTouch( event )
	{
		if ((event.touches && event.touches[0].target.tagName.toLowerCase() !== 'canvas' ) || ( event.target.tagName.toLowerCase() !== 'canvas'))
			return;
		event.preventDefault();
		isTouchingScreen = true;
		if ( !!event.touches )
		{
			mouse.x = event.touches[0].pageX - god.options.canvas.offsetLeft;
			mouse.y = event.touches[0].pageY - god.options.canvas.offsetTop;
		}
		else
		{
			mouse.x = event.pageX - god.options.canvas.offsetLeft;
			mouse.y = event.pageY - god.options.canvas.offsetTop;
		}
		if ( !!switchAudio )
		{
			var audio = document.querySelector( 'audio.audio-2' );
			if ( !audio )
			{
				audio = document.createElement( 'audio' );
				audio.className = 'audio-2';
				audio.removeAttribute( 'controls' );
				audio.loop = true;
				audio.volume = 1;
				body.appendChild( audio );
				audio.src = '../audio/onTouch.mp3';//danosongs.com-living-the-daydream-instr.mp3'
			}
			god.options.audio.pause();
			audio.play();
		}
	}

	function noTouch( event )
	{
		event.preventDefault();
		isTouchingScreen = false;
		if (!!switchAudio )
		{
			var audio = document.querySelector( 'audio.audio-2' );
			audio.pause();
			audio.currentTime = 0;
			god.options.audio.play();
		}

	}

	function mouseMove( event )
	{
		event.preventDefault();
		if ( !!isTouchingScreen )
		{
			mouse.x = event.pageX - god.options.canvas.offsetLeft;
			mouse.y = event.pageY - god.options.canvas.offsetTop;
		}
	}

	function touchMove( event )
	{
		event.preventDefault();
		if ( !!isTouchingScreen )
		{
			mouse.x = event.touches[0].pageX - god.options.canvas.offsetLeft;
			mouse.y = event.touches[0].pageY - god.options.canvas.offsetTop;
		}
	}

	function initialize()
	{
		god.options.canvas = document.createElement( 'canvas' ),
		god.options.box = document.createElement( 'div' );
		god.options.box.className = 'box';
		body.appendChild( god.options.canvas );
		body.appendChild( god.options.box );
		if ( !!( isModernEnough ) )
		{
			context = god.options.canvas.getContext( '2d' );
			window.onresize = function ()
			{
				god.options.canvas.width = window.innerWidth;
				god.options.canvas.height = window.innerHeight;
			};
			if ( 'ontouchstart' in window )
			{
				document.addEventListener( 'touchstart', applyTouch, false );
				document.addEventListener( 'touchend', noTouch, false );
				document.addEventListener( 'touchmove', touchMove, false );
			}
			else
			{
				document.addEventListener( 'mousedown', applyTouch, false );
				document.addEventListener( 'mouseup', noTouch, false );
				document.addEventListener( 'mousemove', mouseMove, false );
			}
		}
		else
		{
			//TODO, browser does not support canvas
		}
		createParticles();
	}

	var clear = function ()
	{
		var particle = this,
			width = ( 2 * particle.radius ) + 4,
			ceiling = ( width << 0 === width ? width : ( ( width << 0 ) + 1 ) ),
			x = particle.x - ( width / 2 ),
			y = particle.y - ( width / 2 );

		context.clearRect( ~~( x ), ~~( y ), ceiling, ceiling );
	};
	/*
	 * Create god.options.particles.
	 */

	function createParticles()
	{
		for ( var quantity = 0, len = god.options.maxParticles; quantity < len; quantity++ )
		{
			var x = 10 + ( window.innerWidth || canvas.width ) / len * quantity,
				y = ( window.innerHeight || canvas.height ) / 2,
				radius = ~~( Math.random() * 15 );
			god.options.particles.push(
			{
				x: x,
				y: y,
				goalX: x,
				goalY: y,
				top: 4 + Math.random() * -8,
				bottom: -15 + Math.random() * -20,
				left: -15 + Math.random() * -20,
				right: -5 + Math.random() * -10,
				radius: radius,
				color: god.options.colors[~~( Math.random() * god.options.colors.length )],
				clear: clear,
				checkBounds: checkBounds,
				pulsate: pulsate,
				moveParticle: moveParticle
			} );
		}
	}

	function render()
	{
		[].forEach.call(god.options.particles, function ( particle, index )
		{
			context.save();
			context.globalCompositeOperation = 'lighter';
			context.fillStyle = particle.color;
			context.beginPath();
			context.arc( particle.x, particle.y, particle.radius, 0, Math.PI * 2 );
			context.closePath();
			context.fill();
			context.restore();
		} );
	}

	function pulse()
	{
		update();
		render();
		requestAnimFrame( pulse );
	}
	var checkBounds = function ()
	{
		var particle = this;
		if ( particle.x > god.options.canvas.width + particle.radius * 2 )
		{
			particle.goalX = -particle.radius;
			particle.x = -particle.radius;
		}
		// Bounds bottom
		if ( particle.y > god.options.canvas.height + particle.radius * 2 )
		{
			particle.goalY = -particle.radius;
			particle.y = -particle.radius;
		}
		// Bounds left
		if ( particle.x < -particle.radius * 2 )
		{
			particle.radius *= 4;

			particle.goalX = god.options.canvas.width + particle.radius;
			particle.x = god.options.canvas.width + particle.radius;
		}
		// Bounds top
		if ( particle.y < -particle.radius * 2 )
		{
			particle.radius *= 4;
			particle.goalY = god.options.canvas.height + particle.radius;
			particle.y = god.options.canvas.height + particle.radius;
		}
	};

	var listFunctions = function ()
	{
		this.devilsCurve = function ( center, particle, steps, xOffset, yOffset, force )
		{
			/// <summary>
			/// Sets the particle transform function to devil's curve. 
			/// &#10; Suggestion: change mid-step by setting previous node 'then' callback with timeout.
			/// </summary>
			/// <param name="center">Canvas center, provided by animation callback.</param>
			/// <param name="particle">Particle, provided by animation callback.</param>
			/// <param name="steps">Steps, provided by animation callback. Given by Math.PI * 2 * particleNumber / totalParticles.</param>
			/// <param name="xOffset">User provided. Offests the particle goal X param.</param>
			/// <param name="yOffset">User provided. Offests the particle goal Y param.</param>
			/// <param name="force">User provided. Touch event explosion parameter. Bigger force => bigger explosion. Default is 500. </param>

			maxForce = force || 500;
			var base = ( Math.sqrt(( Math.pow( Math.sin( steps ), 2 ) - 10 * Math.pow( Math.cos( steps ), 2 ) ) / ( Math.pow( Math.sin( steps ), 2 ) - Math.pow( Math.cos( steps ), 2 ) ) ) );
			particle.goalX = center.x + xOffset * Math.cos( steps ) * base;
			particle.goalY = center.y + yOffset * Math.sin( steps ) * base;
		};

		this.heartCurve = function ( center, particle, index, force )
		{
			/// <summary>
			/// Sets the particle transform function to heartCurve
			/// </summary>
			/// <param name="center">Canvas center, provided by animation callback.</param>
			/// <param name="particle">Particle, provided by animation callback.</param>
			/// <param name="index">Current particle number, provided by animation callback.</param>
			/// <param name="force">User provided. Touch event explosion parameter. Bigger force => bigger explosion. Default is 700. </param>

			maxForce = force || 700;
			particle.goalX = center.x + 180 * Math.pow( Math.sin( index ), 3 );
			particle.goalY = center.y + 10 * ( -( 15 * Math.cos( index ) - 5 * Math.cos( 2 * index ) - 2 * Math.cos( 3 * index ) - Math.cos( 4 * index ) ) );
		};

		this.bottomToTop = function ( particle, force)
		{
			/// <summary>
			/// Sets the particle transform function to 'move from bottom to top'.
			/// </summary>
			/// <param name="particle">Particle, provided by animation callback.</param>
			/// <param name="force">User provided. Touch event explosion parameter. Bigger force => bigger explosion. Default is 2500. </param>

			maxForce = force || 2500;
			particle.goalX += particle.top;
			particle.goalY += particle.bottom;
			particle.checkBounds();
		};
		this.rightToLeft = function ( particle, force )
		{
			/// <summary>
			/// Sets the particle transform function to 'move from right to left'.
			/// </summary>
			/// <param name="particle">Particle, provided by animation callback.</param>
			/// <param name="force">User provided. Touch event explosion parameter. Bigger force => bigger explosion. Default is 2500. </param>

			maxForce = force || 2500;
			particle.goalX += particle.bottom;
			particle.goalY += particle.top;
			particle.checkBounds();
		};

		this.bottomRightToTopLeft = function ( particle, force )
		{
			/// <summary>
			/// Sets the particle transform function to 'move from bottom right to top left'.
			/// </summary>
			/// <param name="particle">Particle, provided by animation callback.</param>
			/// <param name="force">User provided. Touch event explosion parameter. Bigger force => bigger explosion. Default is 850. </param>

			maxForce = force || 850;
			particle.goalX += particle.left;
			particle.goalY += particle.right;
			particle.checkBounds();
		};

		this.circle = function (center, particle, steps, radius, force)
		{
			/// <summary>
			/// Sets the particle transform function to circle.
			/// </summary>
			/// <param name="center">Canvas center, provided by animation callback.</param>
			/// <param name="particle">Particle, provided by animation callback.</param>
			/// <param name="steps">Steps, provided by animation callback. Given by Math.PI * 2 * particleNumber / totalParticles.</param>
			/// <param name="radius">User provided. Circle radius around the center.Default is 200. </param>
			/// <param name="force">User provided. Touch event explosion parameter. Bigger force => bigger explosion. Default is 600. </param>

			maxForce = force || 600;
			radius = radius || 200;
			particle.goalX = ( center.x + radius * Math.cos( steps ) );
			particle.goalY = ( center.y + radius * Math.sin( steps ) );
		};

		this.spiral = function ( center, particle, index, angle, radius, force )
		{
			/// <summary>
			/// Sets the particle transform function to spiral.
			/// </summary>
			/// <param name="particle">Particle, provided by animation callback.</param>
			/// <param name="center">Canvas center, provided by animation callback.</param>
			/// <param name="index">Current particle number, provided by animation callback.</param>
			/// <param name="angle">User provided. Spiral angle multiplicator. Default is 0.2. </param>
			/// <param name="radius">User provided. Circle radius around the center.Default is 15. </param>
			/// <param name="force">User provided. Touch event explosion parameter. Bigger force => bigger explosion. Default is 725. </param>

			maxForce = force || 725;
			angle = angle || 0.2;
			radius = radius || 15;
			var currentAngle = index * angle;
			particle.goalX = ( center.x + ( currentAngle * radius ) * Math.cos( currentAngle ) );
			particle.goalY = ( center.y + ( currentAngle * radius ) * Math.sin( currentAngle ) );
		};

		this.slowBidirectionalTopBottom = function( particle, force )
		{
			/// <summary>
			/// Sets the particle transform function to 'move from bottom to top and vice versa'.
			/// </summary>
			/// <param name="particle">Particle, provided by animation callback.</param>
			/// <param name="force">User provided. Touch event explosion parameter. Bigger force => bigger explosion. Default is 1500. </param>

			maxForce = force || 1500;
			particle.goalX += particle.top;
			particle.goalY += particle.top;
			particle.checkBounds();
		};

		this.fastBottomRightToTopLeft = function ( particle, force )
		{
			/// <summary>
			/// Sets the particle transform function to 'move from bottom right to top left at high speed'.
			/// </summary>
			/// <param name="particle">Particle, provided by animation callback.</param>
			/// <param name="force">User provided. Touch event explosion parameter. Bigger force => bigger explosion. Default is 1500. </param>

			maxForce = force || 1500;
			particle.goalX += particle.bottom;
			particle.goalY += particle.bottom;
			particle.checkBounds();
		};

		this.vaginaCurve = function ( center, particle, steps, radius, force )
		{
			/// <summary>
			/// Sets the particle transform function to vagina curve.
			/// </summary>
			/// <param name="center">Canvas center, provided by animation callback.</param>
			/// <param name="particle">Particle, provided by animation callback.</param>
			/// <param name="steps">Steps, provided by animation callback. Given by Math.PI * 2 * particleNumber / totalParticles.</param>
			/// <param name="radius">User provided. Circle radius around the center.Default is 200. </param>
			/// <param name="force">User provided. Touch event explosion parameter. Bigger force => bigger explosion. Default is 500. </param>

			radius = radius || 200;
			maxForce = force || 500;
			particle.goalX = ( center.x + radius * Math.cos( steps ) );
			particle.goalY = ( center.y + radius * Math.tan( steps ) );
		};

		this.straightLine = function( canvas, particle, index, force )
		{
			/// <summary>
			/// Sets the particle transform function to straight line.
			/// </summary>
			/// <param name="canvas">Canvas, provided by animation callback.</param>
			/// <param name="particle">Particle, provided by animation callback.</param>
			/// <param name="index">Current particle number, provided by animation callback.</param>
			/// <param name="force">User provided. Touch event explosion parameter. Bigger force => bigger explosion. Default is 500. </param>

			maxForce = force || 500;
			particle.goalX = 10 + canvas.width / 100 * index;
			particle.goalY = canvas.height / 2;
		};
	};
	this.knownFunctions = new listFunctions();


	function moveParticle(angle)
	{
		var particle = this;
		if ( !!isTouchingScreen )
			minForce = Math.min( minForce + 5, 2000 );
		else
		{
			mouse.x = -99999;
			mouse.y = -99999;
			minForce = Math.max( minForce - 5, 0 );
		}
		var dst = distanceTo( particle, mouse ),
			dist = ( minForce + maxForce ) / dst;
		particle.x += Math.cos( angle ) * dist + ( particle.goalX - particle.x ) * 0.08;
		particle.y += Math.sin( angle ) * dist + ( particle.goalY - particle.y ) * 0.08;
	
	}

	function pulsate()
	{
		var particle = this;
		particle.radius *= 0.96;
		if ( particle.radius <= 2 )
			particle.radius = ~~( Math.random() * 15 );
	}

	function update()
	{
		if ( god.currentNode === null )
		{
			god.currentNode = god.nodeTree[0];
			god.updateBox( god.currentNode.message );
			time = +new Date().getTime();
		}
		if ( !!god.currentNode.timeout )
		{
			if ( +new Date().getTime() - time > god.currentNode.timeout )
			{
				god.currentNode.then( god );
				nodeIndex += 1;
				if ( nodeIndex === god.nodeTree.length )
					nodeIndex = 0;
				god.currentNode = god.nodeTree[nodeIndex];
				god.updateBox( god.currentNode.message );
				time = +new Date().getTime();
			}
		}
		[].forEach.call( god.options.particles, function ( particle, index )
		{
			particle.clear();
			var angle,
				steps,
				center = {
					x: ( innerWidth || god.options.canvas.width ) * 0.5,
					y: ( innerHeight || god.options.canvas.height ) * 0.5
				};
			angle = Math.atan2( particle.y - mouse.y, particle.x - mouse.x );
			steps = Math.PI * 2 * index / god.options.particles.length;
			particle.moveParticle( angle );
			particle.pulsate();

			god.currentNode.animation( god.knownFunctions, god.options.canvas, center, particle, index, angle, steps );
		} );
	}

	function distanceTo(a, b )
	{
		var dx = abs( a.x - b.x ),
			dy = abs( a.y - b.y );
		return Math.sqrt( dx * dx + dy * dy );
	}

	window.requestAnimFrame = ( function ()
	{
		/*
		 * Request new frame by Paul Irish.
		 * 60 FPS.
		 */
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function ( callback )
			{
				window.setTimeout( callback, 1000 / FPS );
			};
	} )();

	initialize();
	return god;
}