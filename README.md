# PRIMA Sommersemester 2022 Maximilian Flack

## Endabgabe
  - Super Blobio 64
  - Maximilian Flack, 263250
  - 2022 Sommersemester
  - MIB 5
  - PRIMA
  - Prof. Jirka Dell'Oro-Friedl
  - Das Spiel: https://maxi-f22.github.io/PRIMA-SS22/Endabgabe/
  - Source-Code: https://github.com/Maxi-F22/PRIMA-SS22/tree/main/Endabgabe
  - Design-Dokument:
  - Wie man spielt:  
    Maus zum Bewegen der Kamera  
    WASD zum Bewegen  
    Leertaste zum Springen  
    Dreifachsprung um höher zu kommen  
  - Ziel des Spiels:  
    Den Stern einsammeln.  
    Dafür muss man zunächst alle Münzen sammeln, anschließend öffnet sich ein Tor, hinter dem sich der Stern verbirgt.
    
    
## Checklist for the final assignment
© Prof. Dipl.-Ing. Jirka R. Dell'Oro-Friedl, HFU
| Nr | Criterion           | Explanation                                                                                                         |
|---:|---------------------|---------------------------------------------------------------------------------------------------------------------|
|  1 | Units and Positions | 0 is at the center of the map. It is also the spawn point of the player character. 1 is the equivalent of 1 meter. The player character is 2 meters tall, the enemies are 1 meter tall and the coins 0.5 meters.  |
|  2 | Hierarchy           | Full explanation in Design Document.<br>-Game<br> -Environment<br>  -Ground<br>  -Skybox<br>  -Borders<br>   -BorderNorth<br>   ...<br>  -StarPlatform<br>   -Door<br>   -Star<br>   -Platforms<br>    -Platform<br>    ...<br> -Avatar<br>  -Body<br>  ->Meshes for Body Parts<br>  -Camera<br>  -Sounds<br> -Entities<br>  -Enemies<br> -Collectibles<br>  -Coins<br> -Sound  <br>Enemies and Coins get created dynamically via code                          |
|  3 | Editor              | Everything that doesnt change its number via code is done in the editor. The player character is created in the editor with multiple meshes. The environment is also created in the editor and the sounds are imported via the editor. Enemies and Coins are created via code.        |
|  4 | Scriptcomponents    | ScrictComponent "EnemyMovement" to assign to every dynamically created Enemy and get them to walk around.           |
|  5 | Extend              | The classes Avatar, Coin and Enemy extend ƒ.Node. The class and ScriptComponent EnemyMovement extends ƒ.ComponentScript. The class EnemyStateMachine extends ƒAid.ComponentStateMachine and the class GameState extends ƒ.Mutable.                                                  |
|  6 | Sound               | The playercharacter makes a sound when it jumps and when it collects a coin. The enemies make sounds. The environment plays sound effects. If all coins are collected, a song begins. If the star is collected, a soundeffect is played. The audio listener is assigned to the player character.|
|  7 | VUI                 | The user interface consists of two elements. One for showing the lives, that the player has left. The other for showing the number of collected coins and the total of all collectible coins.|
|  8 | Event-System        | Events: playerHit, allCoinsCollected, endGame. They were useful, because they could be called from different points in the code and under different conditions.|
|  9 | External Data       | The parameters of the config file are liveCount, enemyCount, coinCount and playerSpeed. Those were chosen, so that the player can adjust the difficulty.    |
|  A | Light               | The node "Environment" has a ComponentLight that creates directional light. It comes from the sky to create depth by adding shadows to the side of objects. Also the star has a ComponentLight, that creates a point light around the star.|
|  B | Physics             | The player characters main mesh has a rigidbody attached to it. All of the ennvironment objects also have rigidbodies, so that the player can't walk or fall through them. The enemies, coins and the star also have rigidbodies, so that collisions can be detected.|
|  C | Net                 | -                                                                       |
|  D | State Machines      | A StateMachineComponent was used to assign states to the enemies. If the player is more than 10 meters away, the just walk in circles. If he is closer than 10, but further than 5 meters, they stand still. If he is closer than 5 meters, they start to attack by running towards the player.            |
|  E | Animation           | The coins were animated to spin in circles. Also if every coin is collected, the door slides open with an animation.                |
