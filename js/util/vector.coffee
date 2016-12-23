class Vector
  # Representation of a two-dimensional vector
  # Compile with coffee -b -c vector.js
  # TODO:
  #   Naming: Vector2D, sub, mul
  #   Remove dist()
  #   Figure out how to make the default compiler work with it
  constructor: (vector) ->
    @x = vector.x
    @y = vector.y
  @fromComponents: (x, y) -> new Vector({x : x, y : y})
  @fromPolar: (r, theta) -> new Vector({x : r * Math.cos(theta), y : r * Math.sin(theta)})
  add: (v) -> new Vector({x: @x + v.x, y: @y + v.y})
  subtract: (v) -> new Vector({x: @x - v.x, y: @y - v.y})
  scMult: (s) -> new Vector({x: s * @x, y: s * @y})
  norm: () -> Math.pow(Math.pow(@x, 2) + Math.pow(@y, 2), 0.5)
  unit: () -> if (@norm() == 0) then Vector2D.ZERO else @mul(1 / @norm())
  transform: (tMatrix) ->
    new Vector({
      x: @x * tMatrix[0][0] + @y * tMatrix[0][1]
      y: @x * tMatrix[1][0] + @y * tMatrix[1][1]
      })
  getAngle: () -> Math.atan2(@y, @x)
  @distance: (v1, v2) -> v1.subtract(v2).norm()
Vector.ZERO = Vector.fromComponents(0, 0)
Vector.NULL = Vector.fromComponents(null, null)
