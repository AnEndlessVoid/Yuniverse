//=============================================================================
// WAY_MessageWindowFacePosition.js
//=============================================================================
/*:
@plugindesc v1.3 This plugin allows you to show a message face on the right 
side. <WAY_MessageWindowFacePosition>

@author waynee95

@param flipLeftSide
@text Flip Left Side
@type boolean
@default false

@param flipRightSide
@text Flip Right Side
@type boolean
@default false

@help
If you are using YEP_MessageCore, place this plugin below it.

==============================================================================
 Plugin Commands
==============================================================================

FacePosition left
- Shows the next face on the left side

FacePosition right
- Shows the next face on the right side

Whenever you call one of these plugin commands, the following faces will be
shown on that position.

==============================================================================
 Terms of Use
==============================================================================
Free for any commercial or non-commercial project! [Credit: waynee95]

==============================================================================
 Contact Information
==============================================================================
If you have any issues or questions, you can contact me via the rpg maker
forums or discord.

Forum Link:
https://forums.rpgmakerweb.com/index.php?threads/waynee95s-small-plugins-addons.78979/

Discord Name:
waynee95#4261

If you wanna support me with a donation you can do that via paypal.
(https://www.paypal.me/waynee95)

==============================================================================
 Changelog
==============================================================================
Version 1.3: 09.09.2017
 - Fixed issue that other plugin commands did not longer work
 
Version 1.2: 09.09.2017
 - Changed some functionalities
 
Version 1.1: 27.06.2017
 - Fixed error with Flip Right Side Parameter
 
Version 1.0: 26.06.2017
 - Release!
*/

//=============================================================================
// Namespaces
//=============================================================================
var Imported = Imported || {};
Imported.WAY_MessageWindowFacePosition = true;

var WAY = WAY || {};
WAY.MessageWindowFacePosition = WAY.MessageWindowFacePosition || {};

(function () {

	'use strict';

	//=============================================================================
	// Plugin Parameters
	//=============================================================================
	var parameters = $plugins.filter(function (plugin) {
		return /<WAY_MessageWindowFacePosition>/ig.test(plugin.description);
	})[0].parameters;

	var paramFlipLeftSide = Boolean(parameters['flipLeftSide'] === 'true');
	var paramFlipRightSide = Boolean(parameters['flipRightSide'] === 'true');

	//=============================================================================
	// Game_Interpreter
	//=============================================================================
	var _Game_Interpreter_pCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function (command, args) {
		_Game_Interpreter_pCommand.apply(this, arguments);
		if (command.toLowerCase() === 'faceposition') {
			$gameSystem._messageFacePosition = args[0].toLowerCase();
		}
	};

	//=============================================================================
	// Game_Message
	//=============================================================================
	Game_Message.prototype.isFacePositionRight = function () {
		return $gameSystem._messageFacePosition === 'right';
	}

	Game_Message.prototype.isFacePositionLeft = function () {
		return !$gameSystem._messageFacePosition || $gameSystem._messageFacePosition === 'left';
	}

	Game_Message.prototype.needsFlip = function () {
		if (this.isFacePositionLeft() && paramFlipLeftSide) {
			return true;
		}
		if (this.isFacePositionRight() && paramFlipRightSide) {
			return true;
		}
		return false;
	}

	Game_Message.prototype.faceX = function () {
		if (this.isFacePositionRight()) {
			return (1 - (2 * paramFlipRightSide)) * (Window_Message.prototype.windowWidth() - Window_Base._faceWidth - Window_Message.prototype.standardPadding() * 2);
		}
		return 0;
	};

	//=============================================================================
	// Game_Message
	//=============================================================================
	var _Window_Message_newLineX = Window_Message.prototype.newLineX;
	Window_Message.prototype.newLineX = function () {
		if ($gameMessage.isFacePositionRight() && $gameMessage.faceName() !== '') {
			return 0;
		}
		return _Window_Message_newLineX.call(this);
	};

	Window_Base.prototype.wordwrapWidth = function () {
		if ($gameMessage.isFacePositionRight()) {
			return this.windowWidth() - (Window_Base._faceWidth) - (this.standardPadding() * 2);
		} else {
			return this.contentsWidth();
		}
	};

	Window_Message.prototype.drawMessageFace = function () {
		this.drawFace($gameMessage.faceName(), $gameMessage.faceIndex(), $gameMessage.faceX(), 0);
	};

	Window_Message.prototype.drawFace = function (faceName, faceIndex, x, y, width, height) {
		width = width || Window_Base._faceWidth;
		height = height || Window_Base._faceHeight;
		var bitmap = ImageManager.loadFace(faceName);
		var pw = Window_Base._faceWidth;
		var ph = Window_Base._faceHeight;
		var sw = Math.min(width, pw);
		var sh = Math.min(height, ph);
		var dx = Math.floor(x + Math.max(width - pw, 0) / 2);
		var dy = Math.floor(y + Math.max(height - ph, 0) / 2);
		var sx = faceIndex % 4 * pw + (pw - sw) / 2;
		var sy = Math.floor(faceIndex / 4) * ph + (ph - sh) / 2;
		this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy, null, null, $gameMessage.needsFlip());
	};

	//=============================================================================
	// Bitmap --Taken from https://gist.github.com/baflink/256ba2bb848427fb24f9f201903d959a
	//=============================================================================
	Bitmap.prototype.blt = function (source, sx, sy, sw, sh, dx, dy, dw, dh, flipX, flipY) {
		dw = dw || sw;
		dh = dh || sh;

		if (flipX || flipY) {
			this._context.save();

			if (flipX) {
				this._context.scale(-1, 1);
				dx = dx - (dw * 0.5) - (sw * 0.5);
			}

			if (flipY) {
				this._context.scale(1, -1);
				dy = dy - (dh * 0.5) - (sh * 0.5);
			}
		}

		if (sx >= 0 && sy >= 0 && sw > 0 && sh > 0 && dw > 0 && dh > 0 && sx + sw <= source.width && sy + sh <= source.height) {
			this._context.globalCompositeOperation = 'source-over';
			this._context.drawImage(source._canvas, sx, sy, sw, sh, dx, dy, dw, dh);
			this._setDirty();
		}

		if (flipX || flipY) {
			this._context.restore();
		}
	};

})();
//------------------------------------------------------------------------------