var Module = require('../models/module').developerModule;
var constants = require('../models/module').constants;
var repositoryCtrl = require('../controllers/repositoryCtrl');
var exportCtrl = require('../controllers/exportCtrl');

// Adding a new module from a local file
exports.add = function(req, res) {
  Module.findOne({ email: req.user.email, moduleId: req.body.moduleId }, function(err, module) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (module) {
        update(req, res, module);
      } else {
        insert(req, res);
      }
    }
  });
};

var insert = function(req, res) {
  var today = new Date();

  // get the module content
  var module = req.body;

  // set all required technical fields (overriding anything set by the user)
  module.email = req.user.email;
  module.moduleVersion = 0;
  module.created_by = req.user.email;
  module.created_at = today;
  module.updated_at = today;
  module.moduleStatus = constants.MODULE_STATUS_READY;
  module.moduleType = '';

  Module.create(module, function(err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(module);
    }
  });
};

var update = function(req, res, module) {
  var today = new Date();

  // update technical fields
  module.updated_at = today;

  // update user defined information
  module.moduleType = req.body.moduleType;
  module.moduleLabel = req.body.moduleLabel;
  module.projectUrl = req.body.projectUrl;
  module.moduleDefinition = req.body.moduleDefinition;
  module.moduleName = req.body.moduleName;
  module.moduleAuthor = req.body.moduleAuthor;
  module.moduleIcon = req.body.moduleIcon;
  module.markModified('moduleDefinition');

  // update runtime information
  module.maxSessionId = req.body.maxSessionId;
  module.moduleProperties = req.body.moduleProperties;
  module.sessions = req.body.sessions;
  module.markModified('moduleProperties');
  module.markModified('sessions');

  module.save(function(err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(module);
    }
  });
};


exports.getAll = function(req, res) {
  Module.find({ email: req.user.email }, function(err, modules) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(modules);
    }
  });
};

exports.get = function(req, res) {
  Module.findOne({ email: req.user.email, moduleId: req.params.moduleId }, function(err, module) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(module);
    }
  });
};

exports.remove = function(req, res) {
  Module.remove({ email: req.user.email, moduleId: req.params.moduleId }, function(err, module) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json({ message: 'Module removed.' });
    }
  });
};

exports.publish = function(req, res) {
  Module.findOne({ email: req.user.email, moduleId: req.params.moduleId }, function(err, module) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (module) {
        // we got the module, now let's add it to the repository
        module.moduleType = req.params.moduleType;
        repositoryCtrl.add(module, res);

        module.save(function(err, data) {
          if (err) {
            res.status(500).send(err);
          } else {
            res.json(module);
          }
        });
      } else {
        res.status(500).send({ message: 'Module not found.'});
      }
    }
  });
};

exports.unpublish = function(req, res) {
  Module.findOne({ email: req.user.email, moduleId: req.params.moduleId }, function(err, module) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (module) {
        // we got the module, now let's remove it from the repository
        repositoryCtrl.remove(module.moduleId, res);

        module.moduleType = '';
        module.save(function(err, data) {
          if (err) {
            res.status(500).send(err);
          } else {
            res.json(module);
          }
        });
      } else {
        res.status(500).send({ message: 'Module not found.' });
      }
    }
  });
};

exports.addTrials = function(req, res) {
  Module.findOne({ email: req.user.email, moduleId: req.params.moduleId }, function(err, module) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (module) {
          exportCtrl.createTrialFile(req, module, 'developer', res);
      } else {
        res.status(500).send({ message: 'Module not found.' });
      }
    }
  });
};