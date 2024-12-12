class Resources {
    constructor() {
        this.toLoad = {
            walls: "/sprites/world_tileset.png",
            ground: "/sprites/ground.png",
            player1: "/sprites/Player1.png",
            player2: "/sprites/Player2.png",
            player3: "/sprites/Player3.png",
            player4: "/sprites/Player4.png",
            fullGreyHeart: "/healthHearts/fullGrey.png",
            emptyGreyHeart: "/healthHearts/emptyGrey.png",
            fullYellowHeart: "/healthHearts/fullYellow.png",
            emptyYellowHeart: "/healthHearts/emptyYellow.png",
            fullDarkRedHeart: "/healthHearts/fullDarkRed.png",
            emptyDarkRedHeart: "/healthHearts/emptyDarkRed.png",
            fullGreenHeart: "/healthHearts/fullGreen.png",
            emptyGreenHeart: "/healthHearts/emptyGreen.png"
        };
        
        this.images = {};

        Object.keys(this.toLoad).forEach(key => {
            const img = new Image();
            img.src = this.toLoad[key];
            this.images[key] = {
                image: img, 
                isLoaded: false
            }
            img.onload = () => {
                this.images[key].isLoaded = true;
            }
        })
    }
}

export const resources = new Resources();
