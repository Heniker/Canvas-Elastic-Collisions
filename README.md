# Canvas-Elastic-Collisions

https://heniker.github.io/Canvas-Elastic-Collisions/



### About

So... I started this 'project' to learn more about canvas in JavaScript. Little do I know that even simple physics simulation can be tricky.



*This took more time than I'd like to admit.*



In case you're implementing elastic collisions - there are 2 main things to keep in mind:

1. After collision velocity: 

  [wiki](https://en.wikipedia.org/wiki/Elastic_collision) <br>

  [Great article on solving collisions using vectors](http://www.vobarian.com/collisions/) <br>

  Personally, [Khan academy](https://www.khanacademy.org/) helped me a lot on this solution.

2. Resolving collision. <br>

  When 'balls' collide, even after you give them new velocities, they can still intersect on the next frame you check. <br>

  The 2 possible solutions to this problem are:

   1. Move circles back to the touching point. <br>

      There are many implementations of this approach. Generally speaking - you have to detect in what 'time' collision happened.

   2. Ignore new collision after collision already happened and velocities changed. 

      Something like this might work for most cases:

      ```

      vDif = it.velocity - that.velocity // vector

      pDif = it.position - that.position // vector

      common = vDif * pDif // vector

      if (pDif.length <= it.radius + that.radius && common.x + common.y < 0) {

        // handle collision

      } else {

        // balls are moving away from each other - do nothing

      }

      ```



Also, if circles are moving really fast - they can pass through each other on a single frame without colliding.

AFAIK there isn't easy fix to this problem. You have to check circle position several times on a single render frame.
