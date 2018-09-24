class Pistol {
  constructor(player) {
    this.player = player;
    this.name = "pistol";
    this.index = Pistol.index;
  }
}
Pistol.index = 21;

class Shotgun {
  constructor(player) {
    this.player = player;
    this.name = "shotgun";
    this.index = Shotgun.index;
  }
}
Shotgun.index = 22;

class Uzi {
  constructor(player) {
    this.player = player;
    this.name = "uzi";
    this.index = Uzi.index;
  }
}
Uzi.index = 23;

class Grenade {
  constructor(player) {
    this.player = player;
    this.name = "grenade";
    this.index = Grenade.index;
  }
}
Grenade.index = 24;
