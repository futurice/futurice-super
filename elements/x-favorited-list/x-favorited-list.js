Polymer('x-favorited-list', {
  created: function() {
    this.usernames = [];
  },
  usernamesChanged: function() {
    if (this.usernames && this.usernames.length > 3) {
      this.shown = this.usernames.slice(0,3);
      this.plusCount = this.usernames.length - 3;
    } else {
      this.shown = this.usernames;
      this.plusCount = 0;
    }

  },
  showAll: function() {
    this.shown = this.usernames;
    this.plusCount = 0;
  }
});