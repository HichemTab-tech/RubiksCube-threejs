
export default class Map {
    mapParentHtmlElement;
    domMaps = [];
    #maps = [];
    game;


    constructor(game, mapParentHtmlElement = null) {
        this.game = game;
        this.mapParentHtmlElement = mapParentHtmlElement;
        this.init();
    }

    init() {
        this.makeMapsDom();
    }

    get maps() {
        return this.#maps;
    }

    set maps(value) {
        this.#maps = value;
    }

    makeMapsDom() {
        this.mapParentHtmlElement.innerHTML = "";
        const numbers = [2,4,0,5,1,3];
        for (let i = 0; i < 6; i++) {
            let divMap = $('<div>').addClass('map').attr('data-map', numbers[i]);
            let str = Array(this.game.RubiksSize).fill('auto').join(" ");
            divMap.css({
                'grid-template-rows': str,
                'grid-template-columns': str
            });
            this.domMaps.push([]);
            for (let j = 0; j < Math.pow(this.game.RubiksSize, 2); j+=this.game.RubiksSize) {
                for (let k = 0; k < this.game.RubiksSize; k++) {
                    let divTexture = $('<div>').addClass('one-2d-texture').attr('data-order', this.game.RubiksSize*(this.game.RubiksSize-1)-j+k);
                    divMap.append(divTexture);
                    this.domMaps[i].push(-1);
                }
            }
            let span = $('<span>').addClass('map-name').text(numbers[i]);
            let spanParent = $('<div>').addClass('map-name-parent').append(span);
            let divParent = $('<div>').addClass('one-map-parent').append(divMap).append(spanParent);
            this.mapParentHtmlElement.append(divParent);
        }
    }

    fillMapsDom() {
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < Math.pow(this.game.RubiksSize, 2); j++) {
                this.mapParentHtmlElement.find('.map[data-map="'+i+'"] .one-2d-texture[data-order="'+j+'"]').attr('data-color-index', this.domMaps[i][j]);
            }
        }
    }
}