# mechatomaton
 threejs dynamic sculpture experiment

- [x] Timing
  - animation ran faster than expected because formCurvePoints was set to point to form0CurvePoints instead of deep copying form0CurvePoints.
- [x] Compare animation with Grasshopper
  - looks the same as Grasshopper
- [x] Normal Vector Check
  - the issue isn't the normal vectors. the curves are just too far apart for it to look nice. increase the surface subdivisions from 11 to 30.
- [ ] Shadows Check
- [ ] Mouse rotation system
- [ ] Load CSV without p5js