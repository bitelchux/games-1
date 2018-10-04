class Allies {
  constructor(scene) {
    this.scene = scene;
    this.player = new Player(this.scene, 100, 200);
    this.ally1 = new Ally(this.scene, 132, 200);
    this.ally2 = new Ally(this.scene, 30, 200);
    this.ally3 = new Ally(this.scene, 30, 230);
    this.group = [];
    this.group.push(this.player);
    this.group.push(this.ally1);
    this.group.push(this.ally2);
    this.group.push(this.ally3);

    scene.physics.add.collider(this.player.sprite, scene.forest.obstaclesLayer);
  }

  update(time, delta) {
    this.group.forEach(function(ally) {
      ally.update(time, delta);
    });
  }

  removeAlly(ally) {
    this.group.splice(this.group.indexOf(ally), 1);
  }
}
