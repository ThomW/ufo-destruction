# UFO Destruction
A dumb breakout game I made in four hours for a gamejam

![screenshot](https://github.com/ThomW/ufo-destruction/blob/master/screenshots/title.png?raw=true)

[Play the game](https://lmnopc.com/ufo/)

# Making the Sausage

I started with the source code of [Phaser.io 3's Breakout Sample Game](https://phaser.io/examples/v3/view/games/breakout/breakout), and flipped the game upside down just to see how it might work. 

I then fired up [Inkscape](https://inkscape.org/) and drew the ship, and a set of windows to replace the bricks in the game.  

I then added the logic to build the buildings. I spent the most time getting the buildings working the way I wanted them. In my first pass, the window graphics inclued the building color, and I wanted to avoid that, so I kept going back and forth with approaches to get something else working.  I finally settled on tying a Rectangle that was rendered behind each Sprite, so I could just draw generic features without worry about the walls because I knew they'd just be along for the ride.  

Once I got the buildings rendering, I then spent a bunch of time figuring out how to randomize the cities, and that turned out to be pretty simple - I have a blueprints array that has two dimensions - width and height in brick units and just randomly create buildings of different widths and heights. Nothing special.  

I then added some variation to the distance between the buildings as in Rampage (which was obviously on my mind from the second I drew my first windows) to get away from the game looking like a giant wall.  

Once I had the spacing half decent, I created the building toppers, and the doors at street level.  I'd love to add more variation, but four hours ... lol 

At this point, the game was largely playable. I moved things around so that level resets would work, added the dumb screen shake that needs to be toned down, added score and balls remaining displays, then grabbed my iPad and drew the background. 

I'd done all I could from the couch, and went downstairs to wrap things up. In the final hour, I created the sole sound effect using [sfxr](https://github.com/grimfang4/sfxr), added some found code that helped scale the game up to fill the entire screen, created the title screen, final testing, then uploaded the project to the game jam [itch.io](https://thomw.itch.io/ufo-destruction). 

# If I had more time

I'd still spend all weekend in the pool, but if it had been raining, it would have been awesome to have been this far Saturday morning, and had the next 60+ hours to polish things up.  I tried making a quick tune in Gargeband that played when the title screen loaded, but I did something wrong, I had an hour left, and it had to go.  

I find it hilarious that in my youth I had a room full of synthesizers and drum machines, and I can't be bothered to make some music for my dumb games. When I finshed G.T. I said to myself, "I'm never leaving sound for last again!" and I did it again. Sound was the last thing I did, and it's obvious. NEXT GAME, amirite? lol

I'd love to add an explosion graphic, and make the buildings react a bit more realistically. I planned to add some logic to have the buildings collapse when its lower level was destroyed (as in Rampage), but I just didn't have the time to work all that out.  

# Thanks for reading this

I know the game's dumb, but whatever. I created all the graphics and modified the Breakout code quite a bit in four hours, and I feel like the end result isn't that bad. I could definitely stand to have a power-up that lets you shoot the buildings as in Arkanoid -- maybe UFO Destruction 2.  haha

