const controller = require('../src/users/controller');

class User {
    constructor(steam_id, display_name, avatar, profile_url, email) {
        this.steam_id = steam_id;
        this.display_name = display_name;
        this.avatar = avatar;
        this.profile_url = profile_url;
        this.email = email;
    }

    save(cb) {

    }
}