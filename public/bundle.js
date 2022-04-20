(() => {
  var __defineProperty = Object.defineProperty;
  var __hasOwnProperty = Object.prototype.hasOwnProperty;
  var __commonJS = (callback, module) => () => {
    if (!module) {
      module = {exports: {}};
      callback(module.exports, module);
    }
    return module.exports;
  };
  var __markAsModule = (target) => {
    return __defineProperty(target, "__esModule", {value: true});
  };
  var __exportStar = (target, module) => {
    __markAsModule(target);
    if (typeof module === "object" || typeof module === "function") {
      for (let key in module)
        if (__hasOwnProperty.call(module, key) && !__hasOwnProperty.call(target, key) && key !== "default")
          __defineProperty(target, key, {get: () => module[key], enumerable: true});
    }
    return target;
  };
  var __toModule = (module) => {
    if (module && module.__esModule)
      return module;
    return __exportStar(__defineProperty({}, "default", {value: module, enumerable: true}), module);
  };

  // node_modules/webm-writer/WebMWriter.js
  var require_WebMWriter = __commonJS((exports, module) => {
    "use strict";
    (function() {
      function extend(base, top) {
        let target = {};
        [base, top].forEach(function(obj) {
          for (let prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
              target[prop] = obj[prop];
            }
          }
        });
        return target;
      }
      function decodeBase64WebPDataURL(url) {
        if (typeof url !== "string" || !url.match(/^data:image\/webp;base64,/i)) {
          throw new Error("Failed to decode WebP Base64 URL");
        }
        return window.atob(url.substring("data:image/webp;base64,".length));
      }
      function renderAsWebP(canvas, quality) {
        let frame = typeof canvas === "string" && /^data:image\/webp/.test(canvas) ? canvas : canvas.toDataURL("image/webp", quality);
        return decodeBase64WebPDataURL(frame);
      }
      function byteStringToUint32LE(string) {
        let a = string.charCodeAt(0), b = string.charCodeAt(1), c = string.charCodeAt(2), d = string.charCodeAt(3);
        return (a | b << 8 | c << 16 | d << 24) >>> 0;
      }
      function extractKeyframeFromWebP(webP) {
        let cursor = webP.indexOf("VP8", 12);
        if (cursor === -1) {
          throw new Error("Bad image format, does this browser support WebP?");
        }
        let hasAlpha = false;
        while (cursor < webP.length - 8) {
          let chunkLength, fourCC;
          fourCC = webP.substring(cursor, cursor + 4);
          cursor += 4;
          chunkLength = byteStringToUint32LE(webP.substring(cursor, cursor + 4));
          cursor += 4;
          switch (fourCC) {
            case "VP8 ":
              return {
                frame: webP.substring(cursor, cursor + chunkLength),
                hasAlpha
              };
            case "ALPH":
              hasAlpha = true;
              break;
          }
          cursor += chunkLength;
          if ((chunkLength & 1) !== 0) {
            cursor++;
          }
        }
        throw new Error("Failed to find VP8 keyframe in WebP image, is this image mistakenly encoded in the Lossless WebP format?");
      }
      const EBML_SIZE_UNKNOWN = -1, EBML_SIZE_UNKNOWN_5_BYTES = -2;
      function EBMLFloat32(value) {
        this.value = value;
      }
      function EBMLFloat64(value) {
        this.value = value;
      }
      function writeEBML(buffer, bufferFileOffset, ebml) {
        if (Array.isArray(ebml)) {
          for (let i = 0; i < ebml.length; i++) {
            writeEBML(buffer, bufferFileOffset, ebml[i]);
          }
        } else if (typeof ebml === "string") {
          buffer.writeString(ebml);
        } else if (ebml instanceof Uint8Array) {
          buffer.writeBytes(ebml);
        } else if (ebml.id) {
          ebml.offset = buffer.pos + bufferFileOffset;
          buffer.writeUnsignedIntBE(ebml.id);
          if (Array.isArray(ebml.data)) {
            let sizePos, dataBegin, dataEnd;
            if (ebml.size === EBML_SIZE_UNKNOWN) {
              buffer.writeByte(255);
            } else if (ebml.size === EBML_SIZE_UNKNOWN_5_BYTES) {
              sizePos = buffer.pos;
              buffer.writeBytes([15, 255, 255, 255, 255]);
            } else {
              sizePos = buffer.pos;
              buffer.writeBytes([0, 0, 0, 0]);
            }
            dataBegin = buffer.pos;
            ebml.dataOffset = dataBegin + bufferFileOffset;
            writeEBML(buffer, bufferFileOffset, ebml.data);
            if (ebml.size !== EBML_SIZE_UNKNOWN && ebml.size !== EBML_SIZE_UNKNOWN_5_BYTES) {
              dataEnd = buffer.pos;
              ebml.size = dataEnd - dataBegin;
              buffer.seek(sizePos);
              buffer.writeEBMLVarIntWidth(ebml.size, 4);
              buffer.seek(dataEnd);
            }
          } else if (typeof ebml.data === "string") {
            buffer.writeEBMLVarInt(ebml.data.length);
            ebml.dataOffset = buffer.pos + bufferFileOffset;
            buffer.writeString(ebml.data);
          } else if (typeof ebml.data === "number") {
            if (!ebml.size) {
              ebml.size = buffer.measureUnsignedInt(ebml.data);
            }
            buffer.writeEBMLVarInt(ebml.size);
            ebml.dataOffset = buffer.pos + bufferFileOffset;
            buffer.writeUnsignedIntBE(ebml.data, ebml.size);
          } else if (ebml.data instanceof EBMLFloat64) {
            buffer.writeEBMLVarInt(8);
            ebml.dataOffset = buffer.pos + bufferFileOffset;
            buffer.writeDoubleBE(ebml.data.value);
          } else if (ebml.data instanceof EBMLFloat32) {
            buffer.writeEBMLVarInt(4);
            ebml.dataOffset = buffer.pos + bufferFileOffset;
            buffer.writeFloatBE(ebml.data.value);
          } else if (ebml.data instanceof Uint8Array) {
            buffer.writeEBMLVarInt(ebml.data.byteLength);
            ebml.dataOffset = buffer.pos + bufferFileOffset;
            buffer.writeBytes(ebml.data);
          } else {
            throw new Error("Bad EBML datatype " + typeof ebml.data);
          }
        } else {
          throw new Error("Bad EBML datatype " + typeof ebml.data);
        }
      }
      let WebMWriter2 = function(ArrayBufferDataStream, BlobBuffer) {
        return function(options) {
          let MAX_CLUSTER_DURATION_MSEC = 5e3, DEFAULT_TRACK_NUMBER = 1, writtenHeader = false, videoWidth = 0, videoHeight = 0, alphaBuffer = null, alphaBufferContext = null, alphaBufferData = null, clusterFrameBuffer = [], clusterStartTime = 0, clusterDuration = 0, optionDefaults = {
            quality: 0.95,
            transparent: false,
            alphaQuality: void 0,
            fileWriter: null,
            fd: null,
            frameDuration: null,
            frameRate: null
          }, seekPoints = {
            Cues: {id: new Uint8Array([28, 83, 187, 107]), positionEBML: null},
            SegmentInfo: {id: new Uint8Array([21, 73, 169, 102]), positionEBML: null},
            Tracks: {id: new Uint8Array([22, 84, 174, 107]), positionEBML: null}
          }, ebmlSegment, segmentDuration = {
            id: 17545,
            data: new EBMLFloat64(0)
          }, seekHead, cues = [], blobBuffer = new BlobBuffer(options.fileWriter || options.fd);
          function fileOffsetToSegmentRelative(fileOffset) {
            return fileOffset - ebmlSegment.dataOffset;
          }
          function convertAlphaToGrayscaleImage(source) {
            if (alphaBuffer === null || alphaBuffer.width !== source.width || alphaBuffer.height !== source.height) {
              alphaBuffer = document.createElement("canvas");
              alphaBuffer.width = source.width;
              alphaBuffer.height = source.height;
              alphaBufferContext = alphaBuffer.getContext("2d");
              alphaBufferData = alphaBufferContext.createImageData(alphaBuffer.width, alphaBuffer.height);
            }
            let sourceContext = source.getContext("2d"), sourceData = sourceContext.getImageData(0, 0, source.width, source.height).data, destData = alphaBufferData.data, dstCursor = 0, srcEnd = source.width * source.height * 4;
            for (let srcCursor = 3; srcCursor < srcEnd; srcCursor += 4) {
              let alpha = sourceData[srcCursor];
              destData[dstCursor++] = alpha;
              destData[dstCursor++] = alpha;
              destData[dstCursor++] = alpha;
              destData[dstCursor++] = 255;
            }
            alphaBufferContext.putImageData(alphaBufferData, 0, 0);
            return alphaBuffer;
          }
          function createSeekHead() {
            let seekPositionEBMLTemplate = {
              id: 21420,
              size: 5,
              data: 0
            }, result2 = {
              id: 290298740,
              data: []
            };
            for (let name in seekPoints) {
              let seekPoint = seekPoints[name];
              seekPoint.positionEBML = Object.create(seekPositionEBMLTemplate);
              result2.data.push({
                id: 19899,
                data: [
                  {
                    id: 21419,
                    data: seekPoint.id
                  },
                  seekPoint.positionEBML
                ]
              });
            }
            return result2;
          }
          function writeHeader() {
            seekHead = createSeekHead();
            let ebmlHeader = {
              id: 440786851,
              data: [
                {
                  id: 17030,
                  data: 1
                },
                {
                  id: 17143,
                  data: 1
                },
                {
                  id: 17138,
                  data: 4
                },
                {
                  id: 17139,
                  data: 8
                },
                {
                  id: 17026,
                  data: "webm"
                },
                {
                  id: 17031,
                  data: 2
                },
                {
                  id: 17029,
                  data: 2
                }
              ]
            }, segmentInfo = {
              id: 357149030,
              data: [
                {
                  id: 2807729,
                  data: 1e6
                },
                {
                  id: 19840,
                  data: "webm-writer-js"
                },
                {
                  id: 22337,
                  data: "webm-writer-js"
                },
                segmentDuration
              ]
            }, videoProperties = [
              {
                id: 176,
                data: videoWidth
              },
              {
                id: 186,
                data: videoHeight
              }
            ];
            if (options.transparent) {
              videoProperties.push({
                id: 21440,
                data: 1
              });
            }
            let tracks = {
              id: 374648427,
              data: [
                {
                  id: 174,
                  data: [
                    {
                      id: 215,
                      data: DEFAULT_TRACK_NUMBER
                    },
                    {
                      id: 29637,
                      data: DEFAULT_TRACK_NUMBER
                    },
                    {
                      id: 156,
                      data: 0
                    },
                    {
                      id: 2274716,
                      data: "und"
                    },
                    {
                      id: 134,
                      data: "V_VP8"
                    },
                    {
                      id: 2459272,
                      data: "VP8"
                    },
                    {
                      id: 131,
                      data: 1
                    },
                    {
                      id: 224,
                      data: videoProperties
                    }
                  ]
                }
              ]
            };
            ebmlSegment = {
              id: 408125543,
              size: EBML_SIZE_UNKNOWN_5_BYTES,
              data: [
                seekHead,
                segmentInfo,
                tracks
              ]
            };
            let bufferStream = new ArrayBufferDataStream(256);
            writeEBML(bufferStream, blobBuffer.pos, [ebmlHeader, ebmlSegment]);
            blobBuffer.write(bufferStream.getAsDataArray());
            seekPoints.SegmentInfo.positionEBML.data = fileOffsetToSegmentRelative(segmentInfo.offset);
            seekPoints.Tracks.positionEBML.data = fileOffsetToSegmentRelative(tracks.offset);
            writtenHeader = true;
          }
          function createBlockGroupForTransparentKeyframe(keyframe) {
            let block, blockAdditions, bufferStream = new ArrayBufferDataStream(1 + 2 + 1);
            if (!(keyframe.trackNumber > 0 && keyframe.trackNumber < 127)) {
              throw new Error("TrackNumber must be > 0 and < 127");
            }
            bufferStream.writeEBMLVarInt(keyframe.trackNumber);
            bufferStream.writeU16BE(keyframe.timecode);
            bufferStream.writeByte(0);
            block = {
              id: 161,
              data: [
                bufferStream.getAsDataArray(),
                keyframe.frame
              ]
            };
            blockAdditions = {
              id: 30113,
              data: [
                {
                  id: 166,
                  data: [
                    {
                      id: 238,
                      data: 1
                    },
                    {
                      id: 165,
                      data: keyframe.alpha
                    }
                  ]
                }
              ]
            };
            return {
              id: 160,
              data: [
                block,
                blockAdditions
              ]
            };
          }
          function createSimpleBlockForKeyframe(keyframe) {
            let bufferStream = new ArrayBufferDataStream(1 + 2 + 1);
            if (!(keyframe.trackNumber > 0 && keyframe.trackNumber < 127)) {
              throw new Error("TrackNumber must be > 0 and < 127");
            }
            bufferStream.writeEBMLVarInt(keyframe.trackNumber);
            bufferStream.writeU16BE(keyframe.timecode);
            bufferStream.writeByte(1 << 7);
            return {
              id: 163,
              data: [
                bufferStream.getAsDataArray(),
                keyframe.frame
              ]
            };
          }
          function createContainerForKeyframe(keyframe) {
            if (keyframe.alpha) {
              return createBlockGroupForTransparentKeyframe(keyframe);
            }
            return createSimpleBlockForKeyframe(keyframe);
          }
          function createCluster(cluster) {
            return {
              id: 524531317,
              data: [
                {
                  id: 231,
                  data: Math.round(cluster.timecode)
                }
              ]
            };
          }
          function addCuePoint(trackIndex, clusterTime, clusterFileOffset) {
            cues.push({
              id: 187,
              data: [
                {
                  id: 179,
                  data: clusterTime
                },
                {
                  id: 183,
                  data: [
                    {
                      id: 247,
                      data: trackIndex
                    },
                    {
                      id: 241,
                      data: fileOffsetToSegmentRelative(clusterFileOffset)
                    }
                  ]
                }
              ]
            });
          }
          function writeCues() {
            let ebml = {
              id: 475249515,
              data: cues
            }, cuesBuffer = new ArrayBufferDataStream(16 + cues.length * 32);
            writeEBML(cuesBuffer, blobBuffer.pos, ebml);
            blobBuffer.write(cuesBuffer.getAsDataArray());
            seekPoints.Cues.positionEBML.data = fileOffsetToSegmentRelative(ebml.offset);
          }
          function flushClusterFrameBuffer() {
            if (clusterFrameBuffer.length === 0) {
              return;
            }
            let rawImageSize = 0;
            for (let i = 0; i < clusterFrameBuffer.length; i++) {
              rawImageSize += clusterFrameBuffer[i].frame.length + (clusterFrameBuffer[i].alpha ? clusterFrameBuffer[i].alpha.length : 0);
            }
            let buffer = new ArrayBufferDataStream(rawImageSize + clusterFrameBuffer.length * 64), cluster = createCluster({
              timecode: Math.round(clusterStartTime)
            });
            for (let i = 0; i < clusterFrameBuffer.length; i++) {
              cluster.data.push(createContainerForKeyframe(clusterFrameBuffer[i]));
            }
            writeEBML(buffer, blobBuffer.pos, cluster);
            blobBuffer.write(buffer.getAsDataArray());
            addCuePoint(DEFAULT_TRACK_NUMBER, Math.round(clusterStartTime), cluster.offset);
            clusterFrameBuffer = [];
            clusterStartTime += clusterDuration;
            clusterDuration = 0;
          }
          function validateOptions() {
            if (!options.frameDuration) {
              if (options.frameRate) {
                options.frameDuration = 1e3 / options.frameRate;
              } else {
                throw new Error("Missing required frameDuration or frameRate setting");
              }
            }
            options.quality = Math.max(Math.min(options.quality, 0.99999), 0);
            if (options.alphaQuality === void 0) {
              options.alphaQuality = options.quality;
            } else {
              options.alphaQuality = Math.max(Math.min(options.alphaQuality, 0.99999), 0);
            }
          }
          function addFrameToCluster(frame) {
            frame.trackNumber = DEFAULT_TRACK_NUMBER;
            frame.timecode = Math.round(clusterDuration);
            clusterFrameBuffer.push(frame);
            clusterDuration += frame.duration;
            if (clusterDuration >= MAX_CLUSTER_DURATION_MSEC) {
              flushClusterFrameBuffer();
            }
          }
          function rewriteSeekHead() {
            let seekHeadBuffer = new ArrayBufferDataStream(seekHead.size), oldPos = blobBuffer.pos;
            writeEBML(seekHeadBuffer, seekHead.dataOffset, seekHead.data);
            blobBuffer.seek(seekHead.dataOffset);
            blobBuffer.write(seekHeadBuffer.getAsDataArray());
            blobBuffer.seek(oldPos);
          }
          function rewriteDuration() {
            let buffer = new ArrayBufferDataStream(8), oldPos = blobBuffer.pos;
            buffer.writeDoubleBE(clusterStartTime);
            blobBuffer.seek(segmentDuration.dataOffset);
            blobBuffer.write(buffer.getAsDataArray());
            blobBuffer.seek(oldPos);
          }
          function rewriteSegmentLength() {
            let buffer = new ArrayBufferDataStream(10), oldPos = blobBuffer.pos;
            buffer.writeUnsignedIntBE(ebmlSegment.id);
            buffer.writeEBMLVarIntWidth(blobBuffer.pos - ebmlSegment.dataOffset, 5);
            blobBuffer.seek(ebmlSegment.offset);
            blobBuffer.write(buffer.getAsDataArray());
            blobBuffer.seek(oldPos);
          }
          this.addFrame = function(frame, alpha, overrideFrameDuration) {
            if (!writtenHeader) {
              videoWidth = frame.width || 0;
              videoHeight = frame.height || 0;
              writeHeader();
            }
            let keyframe = extractKeyframeFromWebP(renderAsWebP(frame, options.quality)), frameDuration, frameAlpha = null;
            if (overrideFrameDuration) {
              frameDuration = overrideFrameDuration;
            } else if (typeof alpha == "number") {
              frameDuration = alpha;
            } else {
              frameDuration = options.frameDuration;
            }
            if (options.transparent) {
              if (alpha instanceof HTMLCanvasElement || typeof alpha === "string") {
                frameAlpha = alpha;
              } else if (keyframe.hasAlpha) {
                frameAlpha = convertAlphaToGrayscaleImage(frame);
              }
            }
            addFrameToCluster({
              frame: keyframe.frame,
              duration: frameDuration,
              alpha: frameAlpha ? extractKeyframeFromWebP(renderAsWebP(frameAlpha, options.alphaQuality)).frame : null
            });
          };
          this.complete = function() {
            if (!writtenHeader) {
              writeHeader();
            }
            flushClusterFrameBuffer();
            writeCues();
            rewriteSeekHead();
            rewriteDuration();
            rewriteSegmentLength();
            return blobBuffer.complete("video/webm");
          };
          this.getWrittenSize = function() {
            return blobBuffer.length;
          };
          options = extend(optionDefaults, options || {});
          validateOptions();
        };
      };
      if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
        module.exports = WebMWriter2;
      } else {
        window.WebMWriter = WebMWriter2(window.ArrayBufferDataStream, window.BlobBuffer);
      }
    })();
  });

  // node_modules/webm-writer/ArrayBufferDataStream.js
  var require_ArrayBufferDataStream = __commonJS((exports, module) => {
    "use strict";
    (function() {
      let ArrayBufferDataStream = function(length) {
        this.data = new Uint8Array(length);
        this.pos = 0;
      };
      ArrayBufferDataStream.prototype.seek = function(toOffset) {
        this.pos = toOffset;
      };
      ArrayBufferDataStream.prototype.writeBytes = function(arr) {
        for (let i = 0; i < arr.length; i++) {
          this.data[this.pos++] = arr[i];
        }
      };
      ArrayBufferDataStream.prototype.writeByte = function(b) {
        this.data[this.pos++] = b;
      };
      ArrayBufferDataStream.prototype.writeU8 = ArrayBufferDataStream.prototype.writeByte;
      ArrayBufferDataStream.prototype.writeU16BE = function(u) {
        this.data[this.pos++] = u >> 8;
        this.data[this.pos++] = u;
      };
      ArrayBufferDataStream.prototype.writeDoubleBE = function(d) {
        let bytes = new Uint8Array(new Float64Array([d]).buffer);
        for (let i = bytes.length - 1; i >= 0; i--) {
          this.writeByte(bytes[i]);
        }
      };
      ArrayBufferDataStream.prototype.writeFloatBE = function(d) {
        let bytes = new Uint8Array(new Float32Array([d]).buffer);
        for (let i = bytes.length - 1; i >= 0; i--) {
          this.writeByte(bytes[i]);
        }
      };
      ArrayBufferDataStream.prototype.writeString = function(s) {
        for (let i = 0; i < s.length; i++) {
          this.data[this.pos++] = s.charCodeAt(i);
        }
      };
      ArrayBufferDataStream.prototype.writeEBMLVarIntWidth = function(i, width) {
        switch (width) {
          case 1:
            this.writeU8(1 << 7 | i);
            break;
          case 2:
            this.writeU8(1 << 6 | i >> 8);
            this.writeU8(i);
            break;
          case 3:
            this.writeU8(1 << 5 | i >> 16);
            this.writeU8(i >> 8);
            this.writeU8(i);
            break;
          case 4:
            this.writeU8(1 << 4 | i >> 24);
            this.writeU8(i >> 16);
            this.writeU8(i >> 8);
            this.writeU8(i);
            break;
          case 5:
            this.writeU8(1 << 3 | i / 4294967296 & 7);
            this.writeU8(i >> 24);
            this.writeU8(i >> 16);
            this.writeU8(i >> 8);
            this.writeU8(i);
            break;
          default:
            throw new Error("Bad EBML VINT size " + width);
        }
      };
      ArrayBufferDataStream.prototype.measureEBMLVarInt = function(val) {
        if (val < (1 << 7) - 1) {
          return 1;
        } else if (val < (1 << 14) - 1) {
          return 2;
        } else if (val < (1 << 21) - 1) {
          return 3;
        } else if (val < (1 << 28) - 1) {
          return 4;
        } else if (val < 34359738367) {
          return 5;
        } else {
          throw new Error("EBML VINT size not supported " + val);
        }
      };
      ArrayBufferDataStream.prototype.writeEBMLVarInt = function(i) {
        this.writeEBMLVarIntWidth(i, this.measureEBMLVarInt(i));
      };
      ArrayBufferDataStream.prototype.writeUnsignedIntBE = function(u, width) {
        if (width === void 0) {
          width = this.measureUnsignedInt(u);
        }
        switch (width) {
          case 5:
            this.writeU8(Math.floor(u / 4294967296));
          case 4:
            this.writeU8(u >> 24);
          case 3:
            this.writeU8(u >> 16);
          case 2:
            this.writeU8(u >> 8);
          case 1:
            this.writeU8(u);
            break;
          default:
            throw new Error("Bad UINT size " + width);
        }
      };
      ArrayBufferDataStream.prototype.measureUnsignedInt = function(val) {
        if (val < 1 << 8) {
          return 1;
        } else if (val < 1 << 16) {
          return 2;
        } else if (val < 1 << 24) {
          return 3;
        } else if (val < 4294967296) {
          return 4;
        } else {
          return 5;
        }
      };
      ArrayBufferDataStream.prototype.getAsDataArray = function() {
        if (this.pos < this.data.byteLength) {
          return this.data.subarray(0, this.pos);
        } else if (this.pos == this.data.byteLength) {
          return this.data;
        } else {
          throw new Error("ArrayBufferDataStream's pos lies beyond end of buffer");
        }
      };
      if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
        module.exports = ArrayBufferDataStream;
      } else {
        window.ArrayBufferDataStream = ArrayBufferDataStream;
      }
    })();
  });

  // node_modules/webm-writer/BlobBuffer.js
  var require_BlobBuffer = __commonJS((exports, module) => {
    "use strict";
    (function() {
      let BlobBuffer = function(fs) {
        return function(destination) {
          let buffer = [], writePromise = Promise.resolve(), fileWriter = null, fd = null;
          if (destination && destination.constructor.name === "FileWriter") {
            fileWriter = destination;
          } else if (fs && destination) {
            fd = destination;
          }
          this.pos = 0;
          this.length = 0;
          function readBlobAsBuffer(blob) {
            return new Promise(function(resolve, reject) {
              let reader = new FileReader();
              reader.addEventListener("loadend", function() {
                resolve(reader.result);
              });
              reader.readAsArrayBuffer(blob);
            });
          }
          function convertToUint8Array(thing) {
            return new Promise(function(resolve, reject) {
              if (thing instanceof Uint8Array) {
                resolve(thing);
              } else if (thing instanceof ArrayBuffer || ArrayBuffer.isView(thing)) {
                resolve(new Uint8Array(thing));
              } else if (thing instanceof Blob) {
                resolve(readBlobAsBuffer(thing).then(function(buffer2) {
                  return new Uint8Array(buffer2);
                }));
              } else {
                resolve(readBlobAsBuffer(new Blob([thing])).then(function(buffer2) {
                  return new Uint8Array(buffer2);
                }));
              }
            });
          }
          function measureData(data) {
            let result2 = data.byteLength || data.length || data.size;
            if (!Number.isInteger(result2)) {
              throw new Error("Failed to determine size of element");
            }
            return result2;
          }
          this.seek = function(offset) {
            if (offset < 0) {
              throw new Error("Offset may not be negative");
            }
            if (isNaN(offset)) {
              throw new Error("Offset may not be NaN");
            }
            if (offset > this.length) {
              throw new Error("Seeking beyond the end of file is not allowed");
            }
            this.pos = offset;
          };
          this.write = function(data) {
            let newEntry = {
              offset: this.pos,
              data,
              length: measureData(data)
            }, isAppend = newEntry.offset >= this.length;
            this.pos += newEntry.length;
            this.length = Math.max(this.length, this.pos);
            writePromise = writePromise.then(function() {
              if (fd) {
                return new Promise(function(resolve, reject) {
                  convertToUint8Array(newEntry.data).then(function(dataArray) {
                    let totalWritten = 0, buffer2 = Buffer.from(dataArray.buffer), handleWriteComplete = function(err, written, buffer3) {
                      totalWritten += written;
                      if (totalWritten >= buffer3.length) {
                        resolve();
                      } else {
                        fs.write(fd, buffer3, totalWritten, buffer3.length - totalWritten, newEntry.offset + totalWritten, handleWriteComplete);
                      }
                    };
                    fs.write(fd, buffer2, 0, buffer2.length, newEntry.offset, handleWriteComplete);
                  });
                });
              } else if (fileWriter) {
                return new Promise(function(resolve, reject) {
                  fileWriter.onwriteend = resolve;
                  fileWriter.seek(newEntry.offset);
                  fileWriter.write(new Blob([newEntry.data]));
                });
              } else if (!isAppend) {
                for (let i = 0; i < buffer.length; i++) {
                  let entry = buffer[i];
                  if (!(newEntry.offset + newEntry.length <= entry.offset || newEntry.offset >= entry.offset + entry.length)) {
                    if (newEntry.offset < entry.offset || newEntry.offset + newEntry.length > entry.offset + entry.length) {
                      throw new Error("Overwrite crosses blob boundaries");
                    }
                    if (newEntry.offset == entry.offset && newEntry.length == entry.length) {
                      entry.data = newEntry.data;
                      return;
                    } else {
                      return convertToUint8Array(entry.data).then(function(entryArray) {
                        entry.data = entryArray;
                        return convertToUint8Array(newEntry.data);
                      }).then(function(newEntryArray) {
                        newEntry.data = newEntryArray;
                        entry.data.set(newEntry.data, newEntry.offset - entry.offset);
                      });
                    }
                  }
                }
              }
              buffer.push(newEntry);
            });
          };
          this.complete = function(mimeType) {
            if (fd || fileWriter) {
              writePromise = writePromise.then(function() {
                return null;
              });
            } else {
              writePromise = writePromise.then(function() {
                let result2 = [];
                for (let i = 0; i < buffer.length; i++) {
                  result2.push(buffer[i].data);
                }
                return new Blob(result2, {type: mimeType});
              });
            }
            return writePromise;
          };
        };
      };
      if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
        module.exports = BlobBuffer;
      } else {
        window.BlobBuffer = BlobBuffer(null);
      }
    })();
  });

  // node_modules/webm-writer/browser.js
  var require_browser = __commonJS((exports, module) => {
    module.exports = require_WebMWriter()(require_ArrayBufferDataStream(), require_BlobBuffer()(null));
  });

  // src/mandala.ts
  class Mandala {
    constructor(stage2) {
      this.matrix = new DOMMatrix();
      this.scale = 1;
      this.rotation = 0;
    }
    setScale(scale) {
      this.scale = scale;
      this.update();
    }
    setRotation(angle) {
      this.rotation = angle;
      this.update();
    }
    setPattern(pattern) {
      this.pattern = pattern;
      this.update();
    }
    update() {
      if (!this.pattern) {
        return;
      }
      try {
        this.pattern.setTransform(this.matrix.scale(this.scale).rotate(this.rotation));
      } catch (e) {
        this.matrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
        this.pattern.setTransform(this.matrix.scale(this.scale).rotate(this.rotation));
      }
    }
    render(ctx, params) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      const halfwidth = width / 2;
      const halfheight = height / 2;
      const diagonal = Math.sqrt(width * width + height * height);
      const halfdiag = diagonal / 2;
      ctx.save();
      let angleIncrease = Math.PI / params.symmetries;
      ctx.translate(halfwidth, halfheight);
      ctx.rotate(params.angle / 180 * Math.PI);
      for (let s = 0; s < params.symmetries; s++) {
        ctx.rotate(angleIncrease * 2);
        this.drawSlice(ctx, halfdiag, 1, angleIncrease, params.offset.s * width, params.offset.v * height);
        ctx.scale(1, -1);
        this.drawSlice(ctx, halfdiag, 1, angleIncrease, params.offset.s * width, params.offset.v * height);
        ctx.scale(1, -1);
      }
      ctx.restore();
    }
    drawSlice(ctx, radius, scale, sliceAngle, xOffset, yOffset) {
      ctx.save();
      xOffset = (xOffset || 0) * scale;
      yOffset = (yOffset || 0) * scale;
      ctx.translate(xOffset, yOffset);
      ctx.fillStyle = this.pattern;
      ctx.beginPath();
      ctx.moveTo(-xOffset, -yOffset);
      ctx.lineTo(radius - xOffset, -yOffset);
      ctx.lineTo(radius - xOffset, Math.tan(sliceAngle) * radius - yOffset);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
  var mandala_default = Mandala;

  // src/stage.ts
  class Stage {
    constructor(canvas) {
      this.canvas = canvas;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.ctx = canvas.getContext("2d");
    }
    clear(color2) {
      if (color2) {
        this.ctx.save();
        this.ctx.fillStyle = color2;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
      } else {
        this.ctx.clearRect(0, 0, this.width, this.height);
      }
    }
    drawText(text, font = "bold 48px sans-serif") {
      this.ctx.font = font;
      const textWidth = this.ctx.measureText(text).width;
      this.ctx.fillText(text, this.width / 2 - textWidth / 2, this.height / 2);
    }
    setScale(scale) {
      this.scale = scale;
      this.resize();
    }
    setWidth(width) {
      this.width = width;
      this.resize();
    }
    setHeight(height) {
      this.height = height;
      this.resize();
    }
    resize() {
      this.canvas.width = this.width;
      this.canvas.style.width = `${this.width / this.scale}px`;
      this.canvas.height = this.height;
      this.canvas.style.height = `${this.height / this.scale}px`;
    }
  }
  var stage_default = Stage;

  // node_modules/dat.gui/build/dat.gui.module.js
  function ___$insertStyle(css2) {
    if (!css2) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    var style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.innerHTML = css2;
    document.head.appendChild(style);
    return css2;
  }
  function colorToString(color2, forceCSSHex) {
    var colorFormat = color2.__state.conversionName.toString();
    var r = Math.round(color2.r);
    var g = Math.round(color2.g);
    var b = Math.round(color2.b);
    var a = color2.a;
    var h = Math.round(color2.h);
    var s = color2.s.toFixed(1);
    var v = color2.v.toFixed(1);
    if (forceCSSHex || colorFormat === "THREE_CHAR_HEX" || colorFormat === "SIX_CHAR_HEX") {
      var str = color2.hex.toString(16);
      while (str.length < 6) {
        str = "0" + str;
      }
      return "#" + str;
    } else if (colorFormat === "CSS_RGB") {
      return "rgb(" + r + "," + g + "," + b + ")";
    } else if (colorFormat === "CSS_RGBA") {
      return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    } else if (colorFormat === "HEX") {
      return "0x" + color2.hex.toString(16);
    } else if (colorFormat === "RGB_ARRAY") {
      return "[" + r + "," + g + "," + b + "]";
    } else if (colorFormat === "RGBA_ARRAY") {
      return "[" + r + "," + g + "," + b + "," + a + "]";
    } else if (colorFormat === "RGB_OBJ") {
      return "{r:" + r + ",g:" + g + ",b:" + b + "}";
    } else if (colorFormat === "RGBA_OBJ") {
      return "{r:" + r + ",g:" + g + ",b:" + b + ",a:" + a + "}";
    } else if (colorFormat === "HSV_OBJ") {
      return "{h:" + h + ",s:" + s + ",v:" + v + "}";
    } else if (colorFormat === "HSVA_OBJ") {
      return "{h:" + h + ",s:" + s + ",v:" + v + ",a:" + a + "}";
    }
    return "unknown format";
  }
  var ARR_EACH = Array.prototype.forEach;
  var ARR_SLICE = Array.prototype.slice;
  var Common = {
    BREAK: {},
    extend: function extend(target) {
      this.each(ARR_SLICE.call(arguments, 1), function(obj) {
        var keys = this.isObject(obj) ? Object.keys(obj) : [];
        keys.forEach(function(key) {
          if (!this.isUndefined(obj[key])) {
            target[key] = obj[key];
          }
        }.bind(this));
      }, this);
      return target;
    },
    defaults: function defaults(target) {
      this.each(ARR_SLICE.call(arguments, 1), function(obj) {
        var keys = this.isObject(obj) ? Object.keys(obj) : [];
        keys.forEach(function(key) {
          if (this.isUndefined(target[key])) {
            target[key] = obj[key];
          }
        }.bind(this));
      }, this);
      return target;
    },
    compose: function compose() {
      var toCall = ARR_SLICE.call(arguments);
      return function() {
        var args = ARR_SLICE.call(arguments);
        for (var i = toCall.length - 1; i >= 0; i--) {
          args = [toCall[i].apply(this, args)];
        }
        return args[0];
      };
    },
    each: function each(obj, itr, scope) {
      if (!obj) {
        return;
      }
      if (ARR_EACH && obj.forEach && obj.forEach === ARR_EACH) {
        obj.forEach(itr, scope);
      } else if (obj.length === obj.length + 0) {
        var key = void 0;
        var l = void 0;
        for (key = 0, l = obj.length; key < l; key++) {
          if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) {
            return;
          }
        }
      } else {
        for (var _key in obj) {
          if (itr.call(scope, obj[_key], _key) === this.BREAK) {
            return;
          }
        }
      }
    },
    defer: function defer(fnc) {
      setTimeout(fnc, 0);
    },
    debounce: function debounce(func, threshold, callImmediately) {
      var timeout = void 0;
      return function() {
        var obj = this;
        var args = arguments;
        function delayed() {
          timeout = null;
          if (!callImmediately)
            func.apply(obj, args);
        }
        var callNow = callImmediately || !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(delayed, threshold);
        if (callNow) {
          func.apply(obj, args);
        }
      };
    },
    toArray: function toArray(obj) {
      if (obj.toArray)
        return obj.toArray();
      return ARR_SLICE.call(obj);
    },
    isUndefined: function isUndefined(obj) {
      return obj === void 0;
    },
    isNull: function isNull(obj) {
      return obj === null;
    },
    isNaN: function(_isNaN) {
      function isNaN2(_x) {
        return _isNaN.apply(this, arguments);
      }
      isNaN2.toString = function() {
        return _isNaN.toString();
      };
      return isNaN2;
    }(function(obj) {
      return isNaN(obj);
    }),
    isArray: Array.isArray || function(obj) {
      return obj.constructor === Array;
    },
    isObject: function isObject(obj) {
      return obj === Object(obj);
    },
    isNumber: function isNumber(obj) {
      return obj === obj + 0;
    },
    isString: function isString(obj) {
      return obj === obj + "";
    },
    isBoolean: function isBoolean(obj) {
      return obj === false || obj === true;
    },
    isFunction: function isFunction(obj) {
      return obj instanceof Function;
    }
  };
  var INTERPRETATIONS = [
    {
      litmus: Common.isString,
      conversions: {
        THREE_CHAR_HEX: {
          read: function read(original) {
            var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
            if (test === null) {
              return false;
            }
            return {
              space: "HEX",
              hex: parseInt("0x" + test[1].toString() + test[1].toString() + test[2].toString() + test[2].toString() + test[3].toString() + test[3].toString(), 0)
            };
          },
          write: colorToString
        },
        SIX_CHAR_HEX: {
          read: function read(original) {
            var test = original.match(/^#([A-F0-9]{6})$/i);
            if (test === null) {
              return false;
            }
            return {
              space: "HEX",
              hex: parseInt("0x" + test[1].toString(), 0)
            };
          },
          write: colorToString
        },
        CSS_RGB: {
          read: function read(original) {
            var test = original.match(/^rgb\(\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*\)/);
            if (test === null) {
              return false;
            }
            return {
              space: "RGB",
              r: parseFloat(test[1]),
              g: parseFloat(test[2]),
              b: parseFloat(test[3])
            };
          },
          write: colorToString
        },
        CSS_RGBA: {
          read: function read(original) {
            var test = original.match(/^rgba\(\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*\)/);
            if (test === null) {
              return false;
            }
            return {
              space: "RGB",
              r: parseFloat(test[1]),
              g: parseFloat(test[2]),
              b: parseFloat(test[3]),
              a: parseFloat(test[4])
            };
          },
          write: colorToString
        }
      }
    },
    {
      litmus: Common.isNumber,
      conversions: {
        HEX: {
          read: function read(original) {
            return {
              space: "HEX",
              hex: original,
              conversionName: "HEX"
            };
          },
          write: function write(color2) {
            return color2.hex;
          }
        }
      }
    },
    {
      litmus: Common.isArray,
      conversions: {
        RGB_ARRAY: {
          read: function read(original) {
            if (original.length !== 3) {
              return false;
            }
            return {
              space: "RGB",
              r: original[0],
              g: original[1],
              b: original[2]
            };
          },
          write: function write(color2) {
            return [color2.r, color2.g, color2.b];
          }
        },
        RGBA_ARRAY: {
          read: function read(original) {
            if (original.length !== 4)
              return false;
            return {
              space: "RGB",
              r: original[0],
              g: original[1],
              b: original[2],
              a: original[3]
            };
          },
          write: function write(color2) {
            return [color2.r, color2.g, color2.b, color2.a];
          }
        }
      }
    },
    {
      litmus: Common.isObject,
      conversions: {
        RGBA_OBJ: {
          read: function read(original) {
            if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b) && Common.isNumber(original.a)) {
              return {
                space: "RGB",
                r: original.r,
                g: original.g,
                b: original.b,
                a: original.a
              };
            }
            return false;
          },
          write: function write(color2) {
            return {
              r: color2.r,
              g: color2.g,
              b: color2.b,
              a: color2.a
            };
          }
        },
        RGB_OBJ: {
          read: function read(original) {
            if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b)) {
              return {
                space: "RGB",
                r: original.r,
                g: original.g,
                b: original.b
              };
            }
            return false;
          },
          write: function write(color2) {
            return {
              r: color2.r,
              g: color2.g,
              b: color2.b
            };
          }
        },
        HSVA_OBJ: {
          read: function read(original) {
            if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v) && Common.isNumber(original.a)) {
              return {
                space: "HSV",
                h: original.h,
                s: original.s,
                v: original.v,
                a: original.a
              };
            }
            return false;
          },
          write: function write(color2) {
            return {
              h: color2.h,
              s: color2.s,
              v: color2.v,
              a: color2.a
            };
          }
        },
        HSV_OBJ: {
          read: function read(original) {
            if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v)) {
              return {
                space: "HSV",
                h: original.h,
                s: original.s,
                v: original.v
              };
            }
            return false;
          },
          write: function write(color2) {
            return {
              h: color2.h,
              s: color2.s,
              v: color2.v
            };
          }
        }
      }
    }
  ];
  var result = void 0;
  var toReturn = void 0;
  var interpret = function interpret2() {
    toReturn = false;
    var original = arguments.length > 1 ? Common.toArray(arguments) : arguments[0];
    Common.each(INTERPRETATIONS, function(family) {
      if (family.litmus(original)) {
        Common.each(family.conversions, function(conversion, conversionName) {
          result = conversion.read(original);
          if (toReturn === false && result !== false) {
            toReturn = result;
            result.conversionName = conversionName;
            result.conversion = conversion;
            return Common.BREAK;
          }
        });
        return Common.BREAK;
      }
    });
    return toReturn;
  };
  var tmpComponent = void 0;
  var ColorMath = {
    hsv_to_rgb: function hsv_to_rgb(h, s, v) {
      var hi = Math.floor(h / 60) % 6;
      var f = h / 60 - Math.floor(h / 60);
      var p = v * (1 - s);
      var q = v * (1 - f * s);
      var t = v * (1 - (1 - f) * s);
      var c = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][hi];
      return {
        r: c[0] * 255,
        g: c[1] * 255,
        b: c[2] * 255
      };
    },
    rgb_to_hsv: function rgb_to_hsv(r, g, b) {
      var min = Math.min(r, g, b);
      var max = Math.max(r, g, b);
      var delta = max - min;
      var h = void 0;
      var s = void 0;
      if (max !== 0) {
        s = delta / max;
      } else {
        return {
          h: NaN,
          s: 0,
          v: 0
        };
      }
      if (r === max) {
        h = (g - b) / delta;
      } else if (g === max) {
        h = 2 + (b - r) / delta;
      } else {
        h = 4 + (r - g) / delta;
      }
      h /= 6;
      if (h < 0) {
        h += 1;
      }
      return {
        h: h * 360,
        s,
        v: max / 255
      };
    },
    rgb_to_hex: function rgb_to_hex(r, g, b) {
      var hex = this.hex_with_component(0, 2, r);
      hex = this.hex_with_component(hex, 1, g);
      hex = this.hex_with_component(hex, 0, b);
      return hex;
    },
    component_from_hex: function component_from_hex(hex, componentIndex) {
      return hex >> componentIndex * 8 & 255;
    },
    hex_with_component: function hex_with_component(hex, componentIndex, value) {
      return value << (tmpComponent = componentIndex * 8) | hex & ~(255 << tmpComponent);
    }
  };
  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
    return typeof obj;
  } : function(obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };
  var classCallCheck = function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  var createClass = function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor)
          descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    return function(Constructor, protoProps, staticProps) {
      if (protoProps)
        defineProperties(Constructor.prototype, protoProps);
      if (staticProps)
        defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();
  var get = function get2(object, property, receiver) {
    if (object === null)
      object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === void 0) {
      var parent = Object.getPrototypeOf(object);
      if (parent === null) {
        return void 0;
      } else {
        return get2(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;
      if (getter === void 0) {
        return void 0;
      }
      return getter.call(receiver);
    }
  };
  var inherits = function(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass)
      Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };
  var possibleConstructorReturn = function(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };
  var Color = function() {
    function Color2() {
      classCallCheck(this, Color2);
      this.__state = interpret.apply(this, arguments);
      if (this.__state === false) {
        throw new Error("Failed to interpret color arguments");
      }
      this.__state.a = this.__state.a || 1;
    }
    createClass(Color2, [{
      key: "toString",
      value: function toString() {
        return colorToString(this);
      }
    }, {
      key: "toHexString",
      value: function toHexString() {
        return colorToString(this, true);
      }
    }, {
      key: "toOriginal",
      value: function toOriginal() {
        return this.__state.conversion.write(this);
      }
    }]);
    return Color2;
  }();
  function defineRGBComponent(target, component, componentHexIndex) {
    Object.defineProperty(target, component, {
      get: function get$$1() {
        if (this.__state.space === "RGB") {
          return this.__state[component];
        }
        Color.recalculateRGB(this, component, componentHexIndex);
        return this.__state[component];
      },
      set: function set$$1(v) {
        if (this.__state.space !== "RGB") {
          Color.recalculateRGB(this, component, componentHexIndex);
          this.__state.space = "RGB";
        }
        this.__state[component] = v;
      }
    });
  }
  function defineHSVComponent(target, component) {
    Object.defineProperty(target, component, {
      get: function get$$1() {
        if (this.__state.space === "HSV") {
          return this.__state[component];
        }
        Color.recalculateHSV(this);
        return this.__state[component];
      },
      set: function set$$1(v) {
        if (this.__state.space !== "HSV") {
          Color.recalculateHSV(this);
          this.__state.space = "HSV";
        }
        this.__state[component] = v;
      }
    });
  }
  Color.recalculateRGB = function(color2, component, componentHexIndex) {
    if (color2.__state.space === "HEX") {
      color2.__state[component] = ColorMath.component_from_hex(color2.__state.hex, componentHexIndex);
    } else if (color2.__state.space === "HSV") {
      Common.extend(color2.__state, ColorMath.hsv_to_rgb(color2.__state.h, color2.__state.s, color2.__state.v));
    } else {
      throw new Error("Corrupted color state");
    }
  };
  Color.recalculateHSV = function(color2) {
    var result2 = ColorMath.rgb_to_hsv(color2.r, color2.g, color2.b);
    Common.extend(color2.__state, {
      s: result2.s,
      v: result2.v
    });
    if (!Common.isNaN(result2.h)) {
      color2.__state.h = result2.h;
    } else if (Common.isUndefined(color2.__state.h)) {
      color2.__state.h = 0;
    }
  };
  Color.COMPONENTS = ["r", "g", "b", "h", "s", "v", "hex", "a"];
  defineRGBComponent(Color.prototype, "r", 2);
  defineRGBComponent(Color.prototype, "g", 1);
  defineRGBComponent(Color.prototype, "b", 0);
  defineHSVComponent(Color.prototype, "h");
  defineHSVComponent(Color.prototype, "s");
  defineHSVComponent(Color.prototype, "v");
  Object.defineProperty(Color.prototype, "a", {
    get: function get$$1() {
      return this.__state.a;
    },
    set: function set$$1(v) {
      this.__state.a = v;
    }
  });
  Object.defineProperty(Color.prototype, "hex", {
    get: function get$$1() {
      if (this.__state.space !== "HEX") {
        this.__state.hex = ColorMath.rgb_to_hex(this.r, this.g, this.b);
        this.__state.space = "HEX";
      }
      return this.__state.hex;
    },
    set: function set$$1(v) {
      this.__state.space = "HEX";
      this.__state.hex = v;
    }
  });
  var Controller = function() {
    function Controller2(object, property) {
      classCallCheck(this, Controller2);
      this.initialValue = object[property];
      this.domElement = document.createElement("div");
      this.object = object;
      this.property = property;
      this.__onChange = void 0;
      this.__onFinishChange = void 0;
    }
    createClass(Controller2, [{
      key: "onChange",
      value: function onChange(fnc) {
        this.__onChange = fnc;
        return this;
      }
    }, {
      key: "onFinishChange",
      value: function onFinishChange(fnc) {
        this.__onFinishChange = fnc;
        return this;
      }
    }, {
      key: "setValue",
      value: function setValue(newValue) {
        this.object[this.property] = newValue;
        if (this.__onChange) {
          this.__onChange.call(this, newValue);
        }
        this.updateDisplay();
        return this;
      }
    }, {
      key: "getValue",
      value: function getValue() {
        return this.object[this.property];
      }
    }, {
      key: "updateDisplay",
      value: function updateDisplay() {
        return this;
      }
    }, {
      key: "isModified",
      value: function isModified() {
        return this.initialValue !== this.getValue();
      }
    }]);
    return Controller2;
  }();
  var EVENT_MAP = {
    HTMLEvents: ["change"],
    MouseEvents: ["click", "mousemove", "mousedown", "mouseup", "mouseover"],
    KeyboardEvents: ["keydown"]
  };
  var EVENT_MAP_INV = {};
  Common.each(EVENT_MAP, function(v, k) {
    Common.each(v, function(e) {
      EVENT_MAP_INV[e] = k;
    });
  });
  var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;
  function cssValueToPixels(val) {
    if (val === "0" || Common.isUndefined(val)) {
      return 0;
    }
    var match = val.match(CSS_VALUE_PIXELS);
    if (!Common.isNull(match)) {
      return parseFloat(match[1]);
    }
    return 0;
  }
  var dom = {
    makeSelectable: function makeSelectable(elem, selectable) {
      if (elem === void 0 || elem.style === void 0)
        return;
      elem.onselectstart = selectable ? function() {
        return false;
      } : function() {
      };
      elem.style.MozUserSelect = selectable ? "auto" : "none";
      elem.style.KhtmlUserSelect = selectable ? "auto" : "none";
      elem.unselectable = selectable ? "on" : "off";
    },
    makeFullscreen: function makeFullscreen(elem, hor, vert) {
      var vertical = vert;
      var horizontal = hor;
      if (Common.isUndefined(horizontal)) {
        horizontal = true;
      }
      if (Common.isUndefined(vertical)) {
        vertical = true;
      }
      elem.style.position = "absolute";
      if (horizontal) {
        elem.style.left = 0;
        elem.style.right = 0;
      }
      if (vertical) {
        elem.style.top = 0;
        elem.style.bottom = 0;
      }
    },
    fakeEvent: function fakeEvent(elem, eventType, pars, aux) {
      var params = pars || {};
      var className = EVENT_MAP_INV[eventType];
      if (!className) {
        throw new Error("Event type " + eventType + " not supported.");
      }
      var evt = document.createEvent(className);
      switch (className) {
        case "MouseEvents": {
          var clientX = params.x || params.clientX || 0;
          var clientY = params.y || params.clientY || 0;
          evt.initMouseEvent(eventType, params.bubbles || false, params.cancelable || true, window, params.clickCount || 1, 0, 0, clientX, clientY, false, false, false, false, 0, null);
          break;
        }
        case "KeyboardEvents": {
          var init = evt.initKeyboardEvent || evt.initKeyEvent;
          Common.defaults(params, {
            cancelable: true,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false,
            keyCode: void 0,
            charCode: void 0
          });
          init(eventType, params.bubbles || false, params.cancelable, window, params.ctrlKey, params.altKey, params.shiftKey, params.metaKey, params.keyCode, params.charCode);
          break;
        }
        default: {
          evt.initEvent(eventType, params.bubbles || false, params.cancelable || true);
          break;
        }
      }
      Common.defaults(evt, aux);
      elem.dispatchEvent(evt);
    },
    bind: function bind(elem, event2, func, newBool) {
      var bool = newBool || false;
      if (elem.addEventListener) {
        elem.addEventListener(event2, func, bool);
      } else if (elem.attachEvent) {
        elem.attachEvent("on" + event2, func);
      }
      return dom;
    },
    unbind: function unbind(elem, event2, func, newBool) {
      var bool = newBool || false;
      if (elem.removeEventListener) {
        elem.removeEventListener(event2, func, bool);
      } else if (elem.detachEvent) {
        elem.detachEvent("on" + event2, func);
      }
      return dom;
    },
    addClass: function addClass(elem, className) {
      if (elem.className === void 0) {
        elem.className = className;
      } else if (elem.className !== className) {
        var classes = elem.className.split(/ +/);
        if (classes.indexOf(className) === -1) {
          classes.push(className);
          elem.className = classes.join(" ").replace(/^\s+/, "").replace(/\s+$/, "");
        }
      }
      return dom;
    },
    removeClass: function removeClass(elem, className) {
      if (className) {
        if (elem.className === className) {
          elem.removeAttribute("class");
        } else {
          var classes = elem.className.split(/ +/);
          var index2 = classes.indexOf(className);
          if (index2 !== -1) {
            classes.splice(index2, 1);
            elem.className = classes.join(" ");
          }
        }
      } else {
        elem.className = void 0;
      }
      return dom;
    },
    hasClass: function hasClass(elem, className) {
      return new RegExp("(?:^|\\s+)" + className + "(?:\\s+|$)").test(elem.className) || false;
    },
    getWidth: function getWidth(elem) {
      var style = getComputedStyle(elem);
      return cssValueToPixels(style["border-left-width"]) + cssValueToPixels(style["border-right-width"]) + cssValueToPixels(style["padding-left"]) + cssValueToPixels(style["padding-right"]) + cssValueToPixels(style.width);
    },
    getHeight: function getHeight(elem) {
      var style = getComputedStyle(elem);
      return cssValueToPixels(style["border-top-width"]) + cssValueToPixels(style["border-bottom-width"]) + cssValueToPixels(style["padding-top"]) + cssValueToPixels(style["padding-bottom"]) + cssValueToPixels(style.height);
    },
    getOffset: function getOffset(el) {
      var elem = el;
      var offset = {left: 0, top: 0};
      if (elem.offsetParent) {
        do {
          offset.left += elem.offsetLeft;
          offset.top += elem.offsetTop;
          elem = elem.offsetParent;
        } while (elem);
      }
      return offset;
    },
    isActive: function isActive(elem) {
      return elem === document.activeElement && (elem.type || elem.href);
    }
  };
  var BooleanController = function(_Controller) {
    inherits(BooleanController2, _Controller);
    function BooleanController2(object, property) {
      classCallCheck(this, BooleanController2);
      var _this2 = possibleConstructorReturn(this, (BooleanController2.__proto__ || Object.getPrototypeOf(BooleanController2)).call(this, object, property));
      var _this = _this2;
      _this2.__prev = _this2.getValue();
      _this2.__checkbox = document.createElement("input");
      _this2.__checkbox.setAttribute("type", "checkbox");
      function onChange() {
        _this.setValue(!_this.__prev);
      }
      dom.bind(_this2.__checkbox, "change", onChange, false);
      _this2.domElement.appendChild(_this2.__checkbox);
      _this2.updateDisplay();
      return _this2;
    }
    createClass(BooleanController2, [{
      key: "setValue",
      value: function setValue(v) {
        var toReturn2 = get(BooleanController2.prototype.__proto__ || Object.getPrototypeOf(BooleanController2.prototype), "setValue", this).call(this, v);
        if (this.__onFinishChange) {
          this.__onFinishChange.call(this, this.getValue());
        }
        this.__prev = this.getValue();
        return toReturn2;
      }
    }, {
      key: "updateDisplay",
      value: function updateDisplay() {
        if (this.getValue() === true) {
          this.__checkbox.setAttribute("checked", "checked");
          this.__checkbox.checked = true;
          this.__prev = true;
        } else {
          this.__checkbox.checked = false;
          this.__prev = false;
        }
        return get(BooleanController2.prototype.__proto__ || Object.getPrototypeOf(BooleanController2.prototype), "updateDisplay", this).call(this);
      }
    }]);
    return BooleanController2;
  }(Controller);
  var OptionController = function(_Controller) {
    inherits(OptionController2, _Controller);
    function OptionController2(object, property, opts) {
      classCallCheck(this, OptionController2);
      var _this2 = possibleConstructorReturn(this, (OptionController2.__proto__ || Object.getPrototypeOf(OptionController2)).call(this, object, property));
      var options = opts;
      var _this = _this2;
      _this2.__select = document.createElement("select");
      if (Common.isArray(options)) {
        var map2 = {};
        Common.each(options, function(element) {
          map2[element] = element;
        });
        options = map2;
      }
      Common.each(options, function(value, key) {
        var opt = document.createElement("option");
        opt.innerHTML = key;
        opt.setAttribute("value", value);
        _this.__select.appendChild(opt);
      });
      _this2.updateDisplay();
      dom.bind(_this2.__select, "change", function() {
        var desiredValue = this.options[this.selectedIndex].value;
        _this.setValue(desiredValue);
      });
      _this2.domElement.appendChild(_this2.__select);
      return _this2;
    }
    createClass(OptionController2, [{
      key: "setValue",
      value: function setValue(v) {
        var toReturn2 = get(OptionController2.prototype.__proto__ || Object.getPrototypeOf(OptionController2.prototype), "setValue", this).call(this, v);
        if (this.__onFinishChange) {
          this.__onFinishChange.call(this, this.getValue());
        }
        return toReturn2;
      }
    }, {
      key: "updateDisplay",
      value: function updateDisplay() {
        if (dom.isActive(this.__select))
          return this;
        this.__select.value = this.getValue();
        return get(OptionController2.prototype.__proto__ || Object.getPrototypeOf(OptionController2.prototype), "updateDisplay", this).call(this);
      }
    }]);
    return OptionController2;
  }(Controller);
  var StringController = function(_Controller) {
    inherits(StringController2, _Controller);
    function StringController2(object, property) {
      classCallCheck(this, StringController2);
      var _this2 = possibleConstructorReturn(this, (StringController2.__proto__ || Object.getPrototypeOf(StringController2)).call(this, object, property));
      var _this = _this2;
      function onChange() {
        _this.setValue(_this.__input.value);
      }
      function onBlur() {
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.getValue());
        }
      }
      _this2.__input = document.createElement("input");
      _this2.__input.setAttribute("type", "text");
      dom.bind(_this2.__input, "keyup", onChange);
      dom.bind(_this2.__input, "change", onChange);
      dom.bind(_this2.__input, "blur", onBlur);
      dom.bind(_this2.__input, "keydown", function(e) {
        if (e.keyCode === 13) {
          this.blur();
        }
      });
      _this2.updateDisplay();
      _this2.domElement.appendChild(_this2.__input);
      return _this2;
    }
    createClass(StringController2, [{
      key: "updateDisplay",
      value: function updateDisplay() {
        if (!dom.isActive(this.__input)) {
          this.__input.value = this.getValue();
        }
        return get(StringController2.prototype.__proto__ || Object.getPrototypeOf(StringController2.prototype), "updateDisplay", this).call(this);
      }
    }]);
    return StringController2;
  }(Controller);
  function numDecimals(x) {
    var _x = x.toString();
    if (_x.indexOf(".") > -1) {
      return _x.length - _x.indexOf(".") - 1;
    }
    return 0;
  }
  var NumberController = function(_Controller) {
    inherits(NumberController2, _Controller);
    function NumberController2(object, property, params) {
      classCallCheck(this, NumberController2);
      var _this = possibleConstructorReturn(this, (NumberController2.__proto__ || Object.getPrototypeOf(NumberController2)).call(this, object, property));
      var _params = params || {};
      _this.__min = _params.min;
      _this.__max = _params.max;
      _this.__step = _params.step;
      if (Common.isUndefined(_this.__step)) {
        if (_this.initialValue === 0) {
          _this.__impliedStep = 1;
        } else {
          _this.__impliedStep = Math.pow(10, Math.floor(Math.log(Math.abs(_this.initialValue)) / Math.LN10)) / 10;
        }
      } else {
        _this.__impliedStep = _this.__step;
      }
      _this.__precision = numDecimals(_this.__impliedStep);
      return _this;
    }
    createClass(NumberController2, [{
      key: "setValue",
      value: function setValue(v) {
        var _v = v;
        if (this.__min !== void 0 && _v < this.__min) {
          _v = this.__min;
        } else if (this.__max !== void 0 && _v > this.__max) {
          _v = this.__max;
        }
        if (this.__step !== void 0 && _v % this.__step !== 0) {
          _v = Math.round(_v / this.__step) * this.__step;
        }
        return get(NumberController2.prototype.__proto__ || Object.getPrototypeOf(NumberController2.prototype), "setValue", this).call(this, _v);
      }
    }, {
      key: "min",
      value: function min(minValue) {
        this.__min = minValue;
        return this;
      }
    }, {
      key: "max",
      value: function max(maxValue) {
        this.__max = maxValue;
        return this;
      }
    }, {
      key: "step",
      value: function step(stepValue) {
        this.__step = stepValue;
        this.__impliedStep = stepValue;
        this.__precision = numDecimals(stepValue);
        return this;
      }
    }]);
    return NumberController2;
  }(Controller);
  function roundToDecimal(value, decimals) {
    var tenTo = Math.pow(10, decimals);
    return Math.round(value * tenTo) / tenTo;
  }
  var NumberControllerBox = function(_NumberController) {
    inherits(NumberControllerBox2, _NumberController);
    function NumberControllerBox2(object, property, params) {
      classCallCheck(this, NumberControllerBox2);
      var _this2 = possibleConstructorReturn(this, (NumberControllerBox2.__proto__ || Object.getPrototypeOf(NumberControllerBox2)).call(this, object, property, params));
      _this2.__truncationSuspended = false;
      var _this = _this2;
      var prevY = void 0;
      function onChange() {
        var attempted = parseFloat(_this.__input.value);
        if (!Common.isNaN(attempted)) {
          _this.setValue(attempted);
        }
      }
      function onFinish() {
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.getValue());
        }
      }
      function onBlur() {
        onFinish();
      }
      function onMouseDrag(e) {
        var diff = prevY - e.clientY;
        _this.setValue(_this.getValue() + diff * _this.__impliedStep);
        prevY = e.clientY;
      }
      function onMouseUp() {
        dom.unbind(window, "mousemove", onMouseDrag);
        dom.unbind(window, "mouseup", onMouseUp);
        onFinish();
      }
      function onMouseDown(e) {
        dom.bind(window, "mousemove", onMouseDrag);
        dom.bind(window, "mouseup", onMouseUp);
        prevY = e.clientY;
      }
      _this2.__input = document.createElement("input");
      _this2.__input.setAttribute("type", "text");
      dom.bind(_this2.__input, "change", onChange);
      dom.bind(_this2.__input, "blur", onBlur);
      dom.bind(_this2.__input, "mousedown", onMouseDown);
      dom.bind(_this2.__input, "keydown", function(e) {
        if (e.keyCode === 13) {
          _this.__truncationSuspended = true;
          this.blur();
          _this.__truncationSuspended = false;
          onFinish();
        }
      });
      _this2.updateDisplay();
      _this2.domElement.appendChild(_this2.__input);
      return _this2;
    }
    createClass(NumberControllerBox2, [{
      key: "updateDisplay",
      value: function updateDisplay() {
        this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
        return get(NumberControllerBox2.prototype.__proto__ || Object.getPrototypeOf(NumberControllerBox2.prototype), "updateDisplay", this).call(this);
      }
    }]);
    return NumberControllerBox2;
  }(NumberController);
  function map(v, i1, i2, o1, o2) {
    return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
  }
  var NumberControllerSlider = function(_NumberController) {
    inherits(NumberControllerSlider2, _NumberController);
    function NumberControllerSlider2(object, property, min, max, step) {
      classCallCheck(this, NumberControllerSlider2);
      var _this2 = possibleConstructorReturn(this, (NumberControllerSlider2.__proto__ || Object.getPrototypeOf(NumberControllerSlider2)).call(this, object, property, {min, max, step}));
      var _this = _this2;
      _this2.__background = document.createElement("div");
      _this2.__foreground = document.createElement("div");
      dom.bind(_this2.__background, "mousedown", onMouseDown);
      dom.bind(_this2.__background, "touchstart", onTouchStart);
      dom.addClass(_this2.__background, "slider");
      dom.addClass(_this2.__foreground, "slider-fg");
      function onMouseDown(e) {
        document.activeElement.blur();
        dom.bind(window, "mousemove", onMouseDrag);
        dom.bind(window, "mouseup", onMouseUp);
        onMouseDrag(e);
      }
      function onMouseDrag(e) {
        e.preventDefault();
        var bgRect = _this.__background.getBoundingClientRect();
        _this.setValue(map(e.clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
        return false;
      }
      function onMouseUp() {
        dom.unbind(window, "mousemove", onMouseDrag);
        dom.unbind(window, "mouseup", onMouseUp);
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.getValue());
        }
      }
      function onTouchStart(e) {
        if (e.touches.length !== 1) {
          return;
        }
        dom.bind(window, "touchmove", onTouchMove);
        dom.bind(window, "touchend", onTouchEnd);
        onTouchMove(e);
      }
      function onTouchMove(e) {
        var clientX = e.touches[0].clientX;
        var bgRect = _this.__background.getBoundingClientRect();
        _this.setValue(map(clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
      }
      function onTouchEnd() {
        dom.unbind(window, "touchmove", onTouchMove);
        dom.unbind(window, "touchend", onTouchEnd);
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.getValue());
        }
      }
      _this2.updateDisplay();
      _this2.__background.appendChild(_this2.__foreground);
      _this2.domElement.appendChild(_this2.__background);
      return _this2;
    }
    createClass(NumberControllerSlider2, [{
      key: "updateDisplay",
      value: function updateDisplay() {
        var pct = (this.getValue() - this.__min) / (this.__max - this.__min);
        this.__foreground.style.width = pct * 100 + "%";
        return get(NumberControllerSlider2.prototype.__proto__ || Object.getPrototypeOf(NumberControllerSlider2.prototype), "updateDisplay", this).call(this);
      }
    }]);
    return NumberControllerSlider2;
  }(NumberController);
  var FunctionController = function(_Controller) {
    inherits(FunctionController2, _Controller);
    function FunctionController2(object, property, text) {
      classCallCheck(this, FunctionController2);
      var _this2 = possibleConstructorReturn(this, (FunctionController2.__proto__ || Object.getPrototypeOf(FunctionController2)).call(this, object, property));
      var _this = _this2;
      _this2.__button = document.createElement("div");
      _this2.__button.innerHTML = text === void 0 ? "Fire" : text;
      dom.bind(_this2.__button, "click", function(e) {
        e.preventDefault();
        _this.fire();
        return false;
      });
      dom.addClass(_this2.__button, "button");
      _this2.domElement.appendChild(_this2.__button);
      return _this2;
    }
    createClass(FunctionController2, [{
      key: "fire",
      value: function fire() {
        if (this.__onChange) {
          this.__onChange.call(this);
        }
        this.getValue().call(this.object);
        if (this.__onFinishChange) {
          this.__onFinishChange.call(this, this.getValue());
        }
      }
    }]);
    return FunctionController2;
  }(Controller);
  var ColorController = function(_Controller) {
    inherits(ColorController2, _Controller);
    function ColorController2(object, property) {
      classCallCheck(this, ColorController2);
      var _this2 = possibleConstructorReturn(this, (ColorController2.__proto__ || Object.getPrototypeOf(ColorController2)).call(this, object, property));
      _this2.__color = new Color(_this2.getValue());
      _this2.__temp = new Color(0);
      var _this = _this2;
      _this2.domElement = document.createElement("div");
      dom.makeSelectable(_this2.domElement, false);
      _this2.__selector = document.createElement("div");
      _this2.__selector.className = "selector";
      _this2.__saturation_field = document.createElement("div");
      _this2.__saturation_field.className = "saturation-field";
      _this2.__field_knob = document.createElement("div");
      _this2.__field_knob.className = "field-knob";
      _this2.__field_knob_border = "2px solid ";
      _this2.__hue_knob = document.createElement("div");
      _this2.__hue_knob.className = "hue-knob";
      _this2.__hue_field = document.createElement("div");
      _this2.__hue_field.className = "hue-field";
      _this2.__input = document.createElement("input");
      _this2.__input.type = "text";
      _this2.__input_textShadow = "0 1px 1px ";
      dom.bind(_this2.__input, "keydown", function(e) {
        if (e.keyCode === 13) {
          onBlur.call(this);
        }
      });
      dom.bind(_this2.__input, "blur", onBlur);
      dom.bind(_this2.__selector, "mousedown", function() {
        dom.addClass(this, "drag").bind(window, "mouseup", function() {
          dom.removeClass(_this.__selector, "drag");
        });
      });
      dom.bind(_this2.__selector, "touchstart", function() {
        dom.addClass(this, "drag").bind(window, "touchend", function() {
          dom.removeClass(_this.__selector, "drag");
        });
      });
      var valueField = document.createElement("div");
      Common.extend(_this2.__selector.style, {
        width: "122px",
        height: "102px",
        padding: "3px",
        backgroundColor: "#222",
        boxShadow: "0px 1px 3px rgba(0,0,0,0.3)"
      });
      Common.extend(_this2.__field_knob.style, {
        position: "absolute",
        width: "12px",
        height: "12px",
        border: _this2.__field_knob_border + (_this2.__color.v < 0.5 ? "#fff" : "#000"),
        boxShadow: "0px 1px 3px rgba(0,0,0,0.5)",
        borderRadius: "12px",
        zIndex: 1
      });
      Common.extend(_this2.__hue_knob.style, {
        position: "absolute",
        width: "15px",
        height: "2px",
        borderRight: "4px solid #fff",
        zIndex: 1
      });
      Common.extend(_this2.__saturation_field.style, {
        width: "100px",
        height: "100px",
        border: "1px solid #555",
        marginRight: "3px",
        display: "inline-block",
        cursor: "pointer"
      });
      Common.extend(valueField.style, {
        width: "100%",
        height: "100%",
        background: "none"
      });
      linearGradient(valueField, "top", "rgba(0,0,0,0)", "#000");
      Common.extend(_this2.__hue_field.style, {
        width: "15px",
        height: "100px",
        border: "1px solid #555",
        cursor: "ns-resize",
        position: "absolute",
        top: "3px",
        right: "3px"
      });
      hueGradient(_this2.__hue_field);
      Common.extend(_this2.__input.style, {
        outline: "none",
        textAlign: "center",
        color: "#fff",
        border: 0,
        fontWeight: "bold",
        textShadow: _this2.__input_textShadow + "rgba(0,0,0,0.7)"
      });
      dom.bind(_this2.__saturation_field, "mousedown", fieldDown);
      dom.bind(_this2.__saturation_field, "touchstart", fieldDown);
      dom.bind(_this2.__field_knob, "mousedown", fieldDown);
      dom.bind(_this2.__field_knob, "touchstart", fieldDown);
      dom.bind(_this2.__hue_field, "mousedown", fieldDownH);
      dom.bind(_this2.__hue_field, "touchstart", fieldDownH);
      function fieldDown(e) {
        setSV(e);
        dom.bind(window, "mousemove", setSV);
        dom.bind(window, "touchmove", setSV);
        dom.bind(window, "mouseup", fieldUpSV);
        dom.bind(window, "touchend", fieldUpSV);
      }
      function fieldDownH(e) {
        setH(e);
        dom.bind(window, "mousemove", setH);
        dom.bind(window, "touchmove", setH);
        dom.bind(window, "mouseup", fieldUpH);
        dom.bind(window, "touchend", fieldUpH);
      }
      function fieldUpSV() {
        dom.unbind(window, "mousemove", setSV);
        dom.unbind(window, "touchmove", setSV);
        dom.unbind(window, "mouseup", fieldUpSV);
        dom.unbind(window, "touchend", fieldUpSV);
        onFinish();
      }
      function fieldUpH() {
        dom.unbind(window, "mousemove", setH);
        dom.unbind(window, "touchmove", setH);
        dom.unbind(window, "mouseup", fieldUpH);
        dom.unbind(window, "touchend", fieldUpH);
        onFinish();
      }
      function onBlur() {
        var i = interpret(this.value);
        if (i !== false) {
          _this.__color.__state = i;
          _this.setValue(_this.__color.toOriginal());
        } else {
          this.value = _this.__color.toString();
        }
      }
      function onFinish() {
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.__color.toOriginal());
        }
      }
      _this2.__saturation_field.appendChild(valueField);
      _this2.__selector.appendChild(_this2.__field_knob);
      _this2.__selector.appendChild(_this2.__saturation_field);
      _this2.__selector.appendChild(_this2.__hue_field);
      _this2.__hue_field.appendChild(_this2.__hue_knob);
      _this2.domElement.appendChild(_this2.__input);
      _this2.domElement.appendChild(_this2.__selector);
      _this2.updateDisplay();
      function setSV(e) {
        if (e.type.indexOf("touch") === -1) {
          e.preventDefault();
        }
        var fieldRect = _this.__saturation_field.getBoundingClientRect();
        var _ref = e.touches && e.touches[0] || e, clientX = _ref.clientX, clientY = _ref.clientY;
        var s = (clientX - fieldRect.left) / (fieldRect.right - fieldRect.left);
        var v = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
        if (v > 1) {
          v = 1;
        } else if (v < 0) {
          v = 0;
        }
        if (s > 1) {
          s = 1;
        } else if (s < 0) {
          s = 0;
        }
        _this.__color.v = v;
        _this.__color.s = s;
        _this.setValue(_this.__color.toOriginal());
        return false;
      }
      function setH(e) {
        if (e.type.indexOf("touch") === -1) {
          e.preventDefault();
        }
        var fieldRect = _this.__hue_field.getBoundingClientRect();
        var _ref2 = e.touches && e.touches[0] || e, clientY = _ref2.clientY;
        var h = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
        if (h > 1) {
          h = 1;
        } else if (h < 0) {
          h = 0;
        }
        _this.__color.h = h * 360;
        _this.setValue(_this.__color.toOriginal());
        return false;
      }
      return _this2;
    }
    createClass(ColorController2, [{
      key: "updateDisplay",
      value: function updateDisplay() {
        var i = interpret(this.getValue());
        if (i !== false) {
          var mismatch = false;
          Common.each(Color.COMPONENTS, function(component) {
            if (!Common.isUndefined(i[component]) && !Common.isUndefined(this.__color.__state[component]) && i[component] !== this.__color.__state[component]) {
              mismatch = true;
              return {};
            }
          }, this);
          if (mismatch) {
            Common.extend(this.__color.__state, i);
          }
        }
        Common.extend(this.__temp.__state, this.__color.__state);
        this.__temp.a = 1;
        var flip = this.__color.v < 0.5 || this.__color.s > 0.5 ? 255 : 0;
        var _flip = 255 - flip;
        Common.extend(this.__field_knob.style, {
          marginLeft: 100 * this.__color.s - 7 + "px",
          marginTop: 100 * (1 - this.__color.v) - 7 + "px",
          backgroundColor: this.__temp.toHexString(),
          border: this.__field_knob_border + "rgb(" + flip + "," + flip + "," + flip + ")"
        });
        this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + "px";
        this.__temp.s = 1;
        this.__temp.v = 1;
        linearGradient(this.__saturation_field, "left", "#fff", this.__temp.toHexString());
        this.__input.value = this.__color.toString();
        Common.extend(this.__input.style, {
          backgroundColor: this.__color.toHexString(),
          color: "rgb(" + flip + "," + flip + "," + flip + ")",
          textShadow: this.__input_textShadow + "rgba(" + _flip + "," + _flip + "," + _flip + ",.7)"
        });
      }
    }]);
    return ColorController2;
  }(Controller);
  var vendors = ["-moz-", "-o-", "-webkit-", "-ms-", ""];
  function linearGradient(elem, x, a, b) {
    elem.style.background = "";
    Common.each(vendors, function(vendor) {
      elem.style.cssText += "background: " + vendor + "linear-gradient(" + x + ", " + a + " 0%, " + b + " 100%); ";
    });
  }
  function hueGradient(elem) {
    elem.style.background = "";
    elem.style.cssText += "background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);";
    elem.style.cssText += "background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
    elem.style.cssText += "background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
    elem.style.cssText += "background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
    elem.style.cssText += "background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
  }
  var css = {
    load: function load(url, indoc) {
      var doc = indoc || document;
      var link = doc.createElement("link");
      link.type = "text/css";
      link.rel = "stylesheet";
      link.href = url;
      doc.getElementsByTagName("head")[0].appendChild(link);
    },
    inject: function inject(cssContent, indoc) {
      var doc = indoc || document;
      var injected = document.createElement("style");
      injected.type = "text/css";
      injected.innerHTML = cssContent;
      var head = doc.getElementsByTagName("head")[0];
      try {
        head.appendChild(injected);
      } catch (e) {
      }
    }
  };
  var saveDialogContents = `<div id="dg-save" class="dg dialogue">

  Here's the new load parameter for your <code>GUI</code>'s constructor:

  <textarea id="dg-new-constructor"></textarea>

  <div id="dg-save-locally">

    <input id="dg-local-storage" type="checkbox"/> Automatically save
    values to <code>localStorage</code> on exit.

    <div id="dg-local-explain">The values saved to <code>localStorage</code> will
      override those passed to <code>dat.GUI</code>'s constructor. This makes it
      easier to work incrementally, but <code>localStorage</code> is fragile,
      and your friends may not see the same values you do.

    </div>

  </div>

</div>`;
  var ControllerFactory = function ControllerFactory2(object, property) {
    var initialValue = object[property];
    if (Common.isArray(arguments[2]) || Common.isObject(arguments[2])) {
      return new OptionController(object, property, arguments[2]);
    }
    if (Common.isNumber(initialValue)) {
      if (Common.isNumber(arguments[2]) && Common.isNumber(arguments[3])) {
        if (Common.isNumber(arguments[4])) {
          return new NumberControllerSlider(object, property, arguments[2], arguments[3], arguments[4]);
        }
        return new NumberControllerSlider(object, property, arguments[2], arguments[3]);
      }
      if (Common.isNumber(arguments[4])) {
        return new NumberControllerBox(object, property, {min: arguments[2], max: arguments[3], step: arguments[4]});
      }
      return new NumberControllerBox(object, property, {min: arguments[2], max: arguments[3]});
    }
    if (Common.isString(initialValue)) {
      return new StringController(object, property);
    }
    if (Common.isFunction(initialValue)) {
      return new FunctionController(object, property, "");
    }
    if (Common.isBoolean(initialValue)) {
      return new BooleanController(object, property);
    }
    return null;
  };
  function requestAnimationFrame(callback) {
    setTimeout(callback, 1e3 / 60);
  }
  var requestAnimationFrame$1 = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || requestAnimationFrame;
  var CenteredDiv = function() {
    function CenteredDiv2() {
      classCallCheck(this, CenteredDiv2);
      this.backgroundElement = document.createElement("div");
      Common.extend(this.backgroundElement.style, {
        backgroundColor: "rgba(0,0,0,0.8)",
        top: 0,
        left: 0,
        display: "none",
        zIndex: "1000",
        opacity: 0,
        WebkitTransition: "opacity 0.2s linear",
        transition: "opacity 0.2s linear"
      });
      dom.makeFullscreen(this.backgroundElement);
      this.backgroundElement.style.position = "fixed";
      this.domElement = document.createElement("div");
      Common.extend(this.domElement.style, {
        position: "fixed",
        display: "none",
        zIndex: "1001",
        opacity: 0,
        WebkitTransition: "-webkit-transform 0.2s ease-out, opacity 0.2s linear",
        transition: "transform 0.2s ease-out, opacity 0.2s linear"
      });
      document.body.appendChild(this.backgroundElement);
      document.body.appendChild(this.domElement);
      var _this = this;
      dom.bind(this.backgroundElement, "click", function() {
        _this.hide();
      });
    }
    createClass(CenteredDiv2, [{
      key: "show",
      value: function show() {
        var _this = this;
        this.backgroundElement.style.display = "block";
        this.domElement.style.display = "block";
        this.domElement.style.opacity = 0;
        this.domElement.style.webkitTransform = "scale(1.1)";
        this.layout();
        Common.defer(function() {
          _this.backgroundElement.style.opacity = 1;
          _this.domElement.style.opacity = 1;
          _this.domElement.style.webkitTransform = "scale(1)";
        });
      }
    }, {
      key: "hide",
      value: function hide2() {
        var _this = this;
        var hide3 = function hide4() {
          _this.domElement.style.display = "none";
          _this.backgroundElement.style.display = "none";
          dom.unbind(_this.domElement, "webkitTransitionEnd", hide4);
          dom.unbind(_this.domElement, "transitionend", hide4);
          dom.unbind(_this.domElement, "oTransitionEnd", hide4);
        };
        dom.bind(this.domElement, "webkitTransitionEnd", hide3);
        dom.bind(this.domElement, "transitionend", hide3);
        dom.bind(this.domElement, "oTransitionEnd", hide3);
        this.backgroundElement.style.opacity = 0;
        this.domElement.style.opacity = 0;
        this.domElement.style.webkitTransform = "scale(1.1)";
      }
    }, {
      key: "layout",
      value: function layout() {
        this.domElement.style.left = window.innerWidth / 2 - dom.getWidth(this.domElement) / 2 + "px";
        this.domElement.style.top = window.innerHeight / 2 - dom.getHeight(this.domElement) / 2 + "px";
      }
    }]);
    return CenteredDiv2;
  }();
  var styleSheet = ___$insertStyle(".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear;border:0;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button.close-top{position:relative}.dg.main .close-button.close-bottom{position:absolute}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .1s ease-out;-o-transition:height .1s ease-out;-moz-transition:height .1s ease-out;transition:height .1s ease-out;-webkit-transition:overflow .1s linear;-o-transition:overflow .1s linear;-moz-transition:overflow .1s linear;transition:overflow .1s linear}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px;overflow:hidden}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .cr.function .property-name{width:100%}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:7px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.color{overflow:visible}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.color{border-left:3px solid}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2FA1D6}.dg .cr.number input[type=text]{color:#2FA1D6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2FA1D6;max-width:100%}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n");
  css.inject(styleSheet);
  var CSS_NAMESPACE = "dg";
  var HIDE_KEY_CODE = 72;
  var CLOSE_BUTTON_HEIGHT = 20;
  var DEFAULT_DEFAULT_PRESET_NAME = "Default";
  var SUPPORTS_LOCAL_STORAGE = function() {
    try {
      return !!window.localStorage;
    } catch (e) {
      return false;
    }
  }();
  var SAVE_DIALOGUE = void 0;
  var autoPlaceVirgin = true;
  var autoPlaceContainer = void 0;
  var hide = false;
  var hideableGuis = [];
  var GUI = function GUI2(pars) {
    var _this = this;
    var params = pars || {};
    this.domElement = document.createElement("div");
    this.__ul = document.createElement("ul");
    this.domElement.appendChild(this.__ul);
    dom.addClass(this.domElement, CSS_NAMESPACE);
    this.__folders = {};
    this.__controllers = [];
    this.__rememberedObjects = [];
    this.__rememberedObjectIndecesToControllers = [];
    this.__listening = [];
    params = Common.defaults(params, {
      closeOnTop: false,
      autoPlace: true,
      width: GUI2.DEFAULT_WIDTH
    });
    params = Common.defaults(params, {
      resizable: params.autoPlace,
      hideable: params.autoPlace
    });
    if (!Common.isUndefined(params.load)) {
      if (params.preset) {
        params.load.preset = params.preset;
      }
    } else {
      params.load = {preset: DEFAULT_DEFAULT_PRESET_NAME};
    }
    if (Common.isUndefined(params.parent) && params.hideable) {
      hideableGuis.push(this);
    }
    params.resizable = Common.isUndefined(params.parent) && params.resizable;
    if (params.autoPlace && Common.isUndefined(params.scrollable)) {
      params.scrollable = true;
    }
    var useLocalStorage = SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, "isLocal")) === "true";
    var saveToLocalStorage = void 0;
    var titleRow = void 0;
    Object.defineProperties(this, {
      parent: {
        get: function get$$1() {
          return params.parent;
        }
      },
      scrollable: {
        get: function get$$1() {
          return params.scrollable;
        }
      },
      autoPlace: {
        get: function get$$1() {
          return params.autoPlace;
        }
      },
      closeOnTop: {
        get: function get$$1() {
          return params.closeOnTop;
        }
      },
      preset: {
        get: function get$$1() {
          if (_this.parent) {
            return _this.getRoot().preset;
          }
          return params.load.preset;
        },
        set: function set$$1(v) {
          if (_this.parent) {
            _this.getRoot().preset = v;
          } else {
            params.load.preset = v;
          }
          setPresetSelectIndex(this);
          _this.revert();
        }
      },
      width: {
        get: function get$$1() {
          return params.width;
        },
        set: function set$$1(v) {
          params.width = v;
          setWidth(_this, v);
        }
      },
      name: {
        get: function get$$1() {
          return params.name;
        },
        set: function set$$1(v) {
          params.name = v;
          if (titleRow) {
            titleRow.innerHTML = params.name;
          }
        }
      },
      closed: {
        get: function get$$1() {
          return params.closed;
        },
        set: function set$$1(v) {
          params.closed = v;
          if (params.closed) {
            dom.addClass(_this.__ul, GUI2.CLASS_CLOSED);
          } else {
            dom.removeClass(_this.__ul, GUI2.CLASS_CLOSED);
          }
          this.onResize();
          if (_this.__closeButton) {
            _this.__closeButton.innerHTML = v ? GUI2.TEXT_OPEN : GUI2.TEXT_CLOSED;
          }
        }
      },
      load: {
        get: function get$$1() {
          return params.load;
        }
      },
      useLocalStorage: {
        get: function get$$1() {
          return useLocalStorage;
        },
        set: function set$$1(bool) {
          if (SUPPORTS_LOCAL_STORAGE) {
            useLocalStorage = bool;
            if (bool) {
              dom.bind(window, "unload", saveToLocalStorage);
            } else {
              dom.unbind(window, "unload", saveToLocalStorage);
            }
            localStorage.setItem(getLocalStorageHash(_this, "isLocal"), bool);
          }
        }
      }
    });
    if (Common.isUndefined(params.parent)) {
      this.closed = params.closed || false;
      dom.addClass(this.domElement, GUI2.CLASS_MAIN);
      dom.makeSelectable(this.domElement, false);
      if (SUPPORTS_LOCAL_STORAGE) {
        if (useLocalStorage) {
          _this.useLocalStorage = true;
          var savedGui = localStorage.getItem(getLocalStorageHash(this, "gui"));
          if (savedGui) {
            params.load = JSON.parse(savedGui);
          }
        }
      }
      this.__closeButton = document.createElement("div");
      this.__closeButton.innerHTML = GUI2.TEXT_CLOSED;
      dom.addClass(this.__closeButton, GUI2.CLASS_CLOSE_BUTTON);
      if (params.closeOnTop) {
        dom.addClass(this.__closeButton, GUI2.CLASS_CLOSE_TOP);
        this.domElement.insertBefore(this.__closeButton, this.domElement.childNodes[0]);
      } else {
        dom.addClass(this.__closeButton, GUI2.CLASS_CLOSE_BOTTOM);
        this.domElement.appendChild(this.__closeButton);
      }
      dom.bind(this.__closeButton, "click", function() {
        _this.closed = !_this.closed;
      });
    } else {
      if (params.closed === void 0) {
        params.closed = true;
      }
      var titleRowName = document.createTextNode(params.name);
      dom.addClass(titleRowName, "controller-name");
      titleRow = addRow(_this, titleRowName);
      var onClickTitle = function onClickTitle2(e) {
        e.preventDefault();
        _this.closed = !_this.closed;
        return false;
      };
      dom.addClass(this.__ul, GUI2.CLASS_CLOSED);
      dom.addClass(titleRow, "title");
      dom.bind(titleRow, "click", onClickTitle);
      if (!params.closed) {
        this.closed = false;
      }
    }
    if (params.autoPlace) {
      if (Common.isUndefined(params.parent)) {
        if (autoPlaceVirgin) {
          autoPlaceContainer = document.createElement("div");
          dom.addClass(autoPlaceContainer, CSS_NAMESPACE);
          dom.addClass(autoPlaceContainer, GUI2.CLASS_AUTO_PLACE_CONTAINER);
          document.body.appendChild(autoPlaceContainer);
          autoPlaceVirgin = false;
        }
        autoPlaceContainer.appendChild(this.domElement);
        dom.addClass(this.domElement, GUI2.CLASS_AUTO_PLACE);
      }
      if (!this.parent) {
        setWidth(_this, params.width);
      }
    }
    this.__resizeHandler = function() {
      _this.onResizeDebounced();
    };
    dom.bind(window, "resize", this.__resizeHandler);
    dom.bind(this.__ul, "webkitTransitionEnd", this.__resizeHandler);
    dom.bind(this.__ul, "transitionend", this.__resizeHandler);
    dom.bind(this.__ul, "oTransitionEnd", this.__resizeHandler);
    this.onResize();
    if (params.resizable) {
      addResizeHandle(this);
    }
    saveToLocalStorage = function saveToLocalStorage2() {
      if (SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(_this, "isLocal")) === "true") {
        localStorage.setItem(getLocalStorageHash(_this, "gui"), JSON.stringify(_this.getSaveObject()));
      }
    };
    this.saveToLocalStorageIfPossible = saveToLocalStorage;
    function resetWidth() {
      var root = _this.getRoot();
      root.width += 1;
      Common.defer(function() {
        root.width -= 1;
      });
    }
    if (!params.parent) {
      resetWidth();
    }
  };
  GUI.toggleHide = function() {
    hide = !hide;
    Common.each(hideableGuis, function(gui3) {
      gui3.domElement.style.display = hide ? "none" : "";
    });
  };
  GUI.CLASS_AUTO_PLACE = "a";
  GUI.CLASS_AUTO_PLACE_CONTAINER = "ac";
  GUI.CLASS_MAIN = "main";
  GUI.CLASS_CONTROLLER_ROW = "cr";
  GUI.CLASS_TOO_TALL = "taller-than-window";
  GUI.CLASS_CLOSED = "closed";
  GUI.CLASS_CLOSE_BUTTON = "close-button";
  GUI.CLASS_CLOSE_TOP = "close-top";
  GUI.CLASS_CLOSE_BOTTOM = "close-bottom";
  GUI.CLASS_DRAG = "drag";
  GUI.DEFAULT_WIDTH = 245;
  GUI.TEXT_CLOSED = "Close Controls";
  GUI.TEXT_OPEN = "Open Controls";
  GUI._keydownHandler = function(e) {
    if (document.activeElement.type !== "text" && (e.which === HIDE_KEY_CODE || e.keyCode === HIDE_KEY_CODE)) {
      GUI.toggleHide();
    }
  };
  dom.bind(window, "keydown", GUI._keydownHandler, false);
  Common.extend(GUI.prototype, {
    add: function add(object, property) {
      return _add(this, object, property, {
        factoryArgs: Array.prototype.slice.call(arguments, 2)
      });
    },
    addColor: function addColor(object, property) {
      return _add(this, object, property, {
        color: true
      });
    },
    remove: function remove(controller) {
      this.__ul.removeChild(controller.__li);
      this.__controllers.splice(this.__controllers.indexOf(controller), 1);
      var _this = this;
      Common.defer(function() {
        _this.onResize();
      });
    },
    destroy: function destroy() {
      if (this.parent) {
        throw new Error("Only the root GUI should be removed with .destroy(). For subfolders, use gui.removeFolder(folder) instead.");
      }
      if (this.autoPlace) {
        autoPlaceContainer.removeChild(this.domElement);
      }
      var _this = this;
      Common.each(this.__folders, function(subfolder) {
        _this.removeFolder(subfolder);
      });
      dom.unbind(window, "keydown", GUI._keydownHandler, false);
      removeListeners(this);
    },
    addFolder: function addFolder(name) {
      if (this.__folders[name] !== void 0) {
        throw new Error('You already have a folder in this GUI by the name "' + name + '"');
      }
      var newGuiParams = {name, parent: this};
      newGuiParams.autoPlace = this.autoPlace;
      if (this.load && this.load.folders && this.load.folders[name]) {
        newGuiParams.closed = this.load.folders[name].closed;
        newGuiParams.load = this.load.folders[name];
      }
      var gui3 = new GUI(newGuiParams);
      this.__folders[name] = gui3;
      var li = addRow(this, gui3.domElement);
      dom.addClass(li, "folder");
      return gui3;
    },
    removeFolder: function removeFolder(folder) {
      this.__ul.removeChild(folder.domElement.parentElement);
      delete this.__folders[folder.name];
      if (this.load && this.load.folders && this.load.folders[folder.name]) {
        delete this.load.folders[folder.name];
      }
      removeListeners(folder);
      var _this = this;
      Common.each(folder.__folders, function(subfolder) {
        folder.removeFolder(subfolder);
      });
      Common.defer(function() {
        _this.onResize();
      });
    },
    open: function open() {
      this.closed = false;
    },
    close: function close() {
      this.closed = true;
    },
    hide: function hide2() {
      this.domElement.style.display = "none";
    },
    show: function show() {
      this.domElement.style.display = "";
    },
    onResize: function onResize() {
      var root = this.getRoot();
      if (root.scrollable) {
        var top = dom.getOffset(root.__ul).top;
        var h = 0;
        Common.each(root.__ul.childNodes, function(node) {
          if (!(root.autoPlace && node === root.__save_row)) {
            h += dom.getHeight(node);
          }
        });
        if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
          dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
          root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + "px";
        } else {
          dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
          root.__ul.style.height = "auto";
        }
      }
      if (root.__resize_handle) {
        Common.defer(function() {
          root.__resize_handle.style.height = root.__ul.offsetHeight + "px";
        });
      }
      if (root.__closeButton) {
        root.__closeButton.style.width = root.width + "px";
      }
    },
    onResizeDebounced: Common.debounce(function() {
      this.onResize();
    }, 50),
    remember: function remember() {
      if (Common.isUndefined(SAVE_DIALOGUE)) {
        SAVE_DIALOGUE = new CenteredDiv();
        SAVE_DIALOGUE.domElement.innerHTML = saveDialogContents;
      }
      if (this.parent) {
        throw new Error("You can only call remember on a top level GUI.");
      }
      var _this = this;
      Common.each(Array.prototype.slice.call(arguments), function(object) {
        if (_this.__rememberedObjects.length === 0) {
          addSaveMenu(_this);
        }
        if (_this.__rememberedObjects.indexOf(object) === -1) {
          _this.__rememberedObjects.push(object);
        }
      });
      if (this.autoPlace) {
        setWidth(this, this.width);
      }
    },
    getRoot: function getRoot() {
      var gui3 = this;
      while (gui3.parent) {
        gui3 = gui3.parent;
      }
      return gui3;
    },
    getSaveObject: function getSaveObject() {
      var toReturn2 = this.load;
      toReturn2.closed = this.closed;
      if (this.__rememberedObjects.length > 0) {
        toReturn2.preset = this.preset;
        if (!toReturn2.remembered) {
          toReturn2.remembered = {};
        }
        toReturn2.remembered[this.preset] = getCurrentPreset(this);
      }
      toReturn2.folders = {};
      Common.each(this.__folders, function(element, key) {
        toReturn2.folders[key] = element.getSaveObject();
      });
      return toReturn2;
    },
    save: function save() {
      if (!this.load.remembered) {
        this.load.remembered = {};
      }
      this.load.remembered[this.preset] = getCurrentPreset(this);
      markPresetModified(this, false);
      this.saveToLocalStorageIfPossible();
    },
    saveAs: function saveAs(presetName) {
      if (!this.load.remembered) {
        this.load.remembered = {};
        this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
      }
      this.load.remembered[presetName] = getCurrentPreset(this);
      this.preset = presetName;
      addPresetOption(this, presetName, true);
      this.saveToLocalStorageIfPossible();
    },
    revert: function revert(gui3) {
      Common.each(this.__controllers, function(controller) {
        if (!this.getRoot().load.remembered) {
          controller.setValue(controller.initialValue);
        } else {
          recallSavedValue(gui3 || this.getRoot(), controller);
        }
        if (controller.__onFinishChange) {
          controller.__onFinishChange.call(controller, controller.getValue());
        }
      }, this);
      Common.each(this.__folders, function(folder) {
        folder.revert(folder);
      });
      if (!gui3) {
        markPresetModified(this.getRoot(), false);
      }
    },
    listen: function listen(controller) {
      var init = this.__listening.length === 0;
      this.__listening.push(controller);
      if (init) {
        updateDisplays(this.__listening);
      }
    },
    updateDisplay: function updateDisplay() {
      Common.each(this.__controllers, function(controller) {
        controller.updateDisplay();
      });
      Common.each(this.__folders, function(folder) {
        folder.updateDisplay();
      });
    }
  });
  function addRow(gui3, newDom, liBefore) {
    var li = document.createElement("li");
    if (newDom) {
      li.appendChild(newDom);
    }
    if (liBefore) {
      gui3.__ul.insertBefore(li, liBefore);
    } else {
      gui3.__ul.appendChild(li);
    }
    gui3.onResize();
    return li;
  }
  function removeListeners(gui3) {
    dom.unbind(window, "resize", gui3.__resizeHandler);
    if (gui3.saveToLocalStorageIfPossible) {
      dom.unbind(window, "unload", gui3.saveToLocalStorageIfPossible);
    }
  }
  function markPresetModified(gui3, modified) {
    var opt = gui3.__preset_select[gui3.__preset_select.selectedIndex];
    if (modified) {
      opt.innerHTML = opt.value + "*";
    } else {
      opt.innerHTML = opt.value;
    }
  }
  function augmentController(gui3, li, controller) {
    controller.__li = li;
    controller.__gui = gui3;
    Common.extend(controller, {
      options: function options(_options) {
        if (arguments.length > 1) {
          var nextSibling = controller.__li.nextElementSibling;
          controller.remove();
          return _add(gui3, controller.object, controller.property, {
            before: nextSibling,
            factoryArgs: [Common.toArray(arguments)]
          });
        }
        if (Common.isArray(_options) || Common.isObject(_options)) {
          var _nextSibling = controller.__li.nextElementSibling;
          controller.remove();
          return _add(gui3, controller.object, controller.property, {
            before: _nextSibling,
            factoryArgs: [_options]
          });
        }
      },
      name: function name(_name) {
        controller.__li.firstElementChild.firstElementChild.innerHTML = _name;
        return controller;
      },
      listen: function listen() {
        controller.__gui.listen(controller);
        return controller;
      },
      remove: function remove() {
        controller.__gui.remove(controller);
        return controller;
      }
    });
    if (controller instanceof NumberControllerSlider) {
      var box = new NumberControllerBox(controller.object, controller.property, {min: controller.__min, max: controller.__max, step: controller.__step});
      Common.each(["updateDisplay", "onChange", "onFinishChange", "step", "min", "max"], function(method) {
        var pc = controller[method];
        var pb = box[method];
        controller[method] = box[method] = function() {
          var args = Array.prototype.slice.call(arguments);
          pb.apply(box, args);
          return pc.apply(controller, args);
        };
      });
      dom.addClass(li, "has-slider");
      controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
    } else if (controller instanceof NumberControllerBox) {
      var r = function r2(returned) {
        if (Common.isNumber(controller.__min) && Common.isNumber(controller.__max)) {
          var oldName = controller.__li.firstElementChild.firstElementChild.innerHTML;
          var wasListening = controller.__gui.__listening.indexOf(controller) > -1;
          controller.remove();
          var newController = _add(gui3, controller.object, controller.property, {
            before: controller.__li.nextElementSibling,
            factoryArgs: [controller.__min, controller.__max, controller.__step]
          });
          newController.name(oldName);
          if (wasListening)
            newController.listen();
          return newController;
        }
        return returned;
      };
      controller.min = Common.compose(r, controller.min);
      controller.max = Common.compose(r, controller.max);
    } else if (controller instanceof BooleanController) {
      dom.bind(li, "click", function() {
        dom.fakeEvent(controller.__checkbox, "click");
      });
      dom.bind(controller.__checkbox, "click", function(e) {
        e.stopPropagation();
      });
    } else if (controller instanceof FunctionController) {
      dom.bind(li, "click", function() {
        dom.fakeEvent(controller.__button, "click");
      });
      dom.bind(li, "mouseover", function() {
        dom.addClass(controller.__button, "hover");
      });
      dom.bind(li, "mouseout", function() {
        dom.removeClass(controller.__button, "hover");
      });
    } else if (controller instanceof ColorController) {
      dom.addClass(li, "color");
      controller.updateDisplay = Common.compose(function(val) {
        li.style.borderLeftColor = controller.__color.toString();
        return val;
      }, controller.updateDisplay);
      controller.updateDisplay();
    }
    controller.setValue = Common.compose(function(val) {
      if (gui3.getRoot().__preset_select && controller.isModified()) {
        markPresetModified(gui3.getRoot(), true);
      }
      return val;
    }, controller.setValue);
  }
  function recallSavedValue(gui3, controller) {
    var root = gui3.getRoot();
    var matchedIndex = root.__rememberedObjects.indexOf(controller.object);
    if (matchedIndex !== -1) {
      var controllerMap = root.__rememberedObjectIndecesToControllers[matchedIndex];
      if (controllerMap === void 0) {
        controllerMap = {};
        root.__rememberedObjectIndecesToControllers[matchedIndex] = controllerMap;
      }
      controllerMap[controller.property] = controller;
      if (root.load && root.load.remembered) {
        var presetMap = root.load.remembered;
        var preset = void 0;
        if (presetMap[gui3.preset]) {
          preset = presetMap[gui3.preset];
        } else if (presetMap[DEFAULT_DEFAULT_PRESET_NAME]) {
          preset = presetMap[DEFAULT_DEFAULT_PRESET_NAME];
        } else {
          return;
        }
        if (preset[matchedIndex] && preset[matchedIndex][controller.property] !== void 0) {
          var value = preset[matchedIndex][controller.property];
          controller.initialValue = value;
          controller.setValue(value);
        }
      }
    }
  }
  function _add(gui3, object, property, params) {
    if (object[property] === void 0) {
      throw new Error('Object "' + object + '" has no property "' + property + '"');
    }
    var controller = void 0;
    if (params.color) {
      controller = new ColorController(object, property);
    } else {
      var factoryArgs = [object, property].concat(params.factoryArgs);
      controller = ControllerFactory.apply(gui3, factoryArgs);
    }
    if (params.before instanceof Controller) {
      params.before = params.before.__li;
    }
    recallSavedValue(gui3, controller);
    dom.addClass(controller.domElement, "c");
    var name = document.createElement("span");
    dom.addClass(name, "property-name");
    name.innerHTML = controller.property;
    var container = document.createElement("div");
    container.appendChild(name);
    container.appendChild(controller.domElement);
    var li = addRow(gui3, container, params.before);
    dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
    if (controller instanceof ColorController) {
      dom.addClass(li, "color");
    } else {
      dom.addClass(li, _typeof(controller.getValue()));
    }
    augmentController(gui3, li, controller);
    gui3.__controllers.push(controller);
    return controller;
  }
  function getLocalStorageHash(gui3, key) {
    return document.location.href + "." + key;
  }
  function addPresetOption(gui3, name, setSelected) {
    var opt = document.createElement("option");
    opt.innerHTML = name;
    opt.value = name;
    gui3.__preset_select.appendChild(opt);
    if (setSelected) {
      gui3.__preset_select.selectedIndex = gui3.__preset_select.length - 1;
    }
  }
  function showHideExplain(gui3, explain) {
    explain.style.display = gui3.useLocalStorage ? "block" : "none";
  }
  function addSaveMenu(gui3) {
    var div = gui3.__save_row = document.createElement("li");
    dom.addClass(gui3.domElement, "has-save");
    gui3.__ul.insertBefore(div, gui3.__ul.firstChild);
    dom.addClass(div, "save-row");
    var gears = document.createElement("span");
    gears.innerHTML = "&nbsp;";
    dom.addClass(gears, "button gears");
    var button = document.createElement("span");
    button.innerHTML = "Save";
    dom.addClass(button, "button");
    dom.addClass(button, "save");
    var button2 = document.createElement("span");
    button2.innerHTML = "New";
    dom.addClass(button2, "button");
    dom.addClass(button2, "save-as");
    var button3 = document.createElement("span");
    button3.innerHTML = "Revert";
    dom.addClass(button3, "button");
    dom.addClass(button3, "revert");
    var select = gui3.__preset_select = document.createElement("select");
    if (gui3.load && gui3.load.remembered) {
      Common.each(gui3.load.remembered, function(value, key) {
        addPresetOption(gui3, key, key === gui3.preset);
      });
    } else {
      addPresetOption(gui3, DEFAULT_DEFAULT_PRESET_NAME, false);
    }
    dom.bind(select, "change", function() {
      for (var index2 = 0; index2 < gui3.__preset_select.length; index2++) {
        gui3.__preset_select[index2].innerHTML = gui3.__preset_select[index2].value;
      }
      gui3.preset = this.value;
    });
    div.appendChild(select);
    div.appendChild(gears);
    div.appendChild(button);
    div.appendChild(button2);
    div.appendChild(button3);
    if (SUPPORTS_LOCAL_STORAGE) {
      var explain = document.getElementById("dg-local-explain");
      var localStorageCheckBox = document.getElementById("dg-local-storage");
      var saveLocally = document.getElementById("dg-save-locally");
      saveLocally.style.display = "block";
      if (localStorage.getItem(getLocalStorageHash(gui3, "isLocal")) === "true") {
        localStorageCheckBox.setAttribute("checked", "checked");
      }
      showHideExplain(gui3, explain);
      dom.bind(localStorageCheckBox, "change", function() {
        gui3.useLocalStorage = !gui3.useLocalStorage;
        showHideExplain(gui3, explain);
      });
    }
    var newConstructorTextArea = document.getElementById("dg-new-constructor");
    dom.bind(newConstructorTextArea, "keydown", function(e) {
      if (e.metaKey && (e.which === 67 || e.keyCode === 67)) {
        SAVE_DIALOGUE.hide();
      }
    });
    dom.bind(gears, "click", function() {
      newConstructorTextArea.innerHTML = JSON.stringify(gui3.getSaveObject(), void 0, 2);
      SAVE_DIALOGUE.show();
      newConstructorTextArea.focus();
      newConstructorTextArea.select();
    });
    dom.bind(button, "click", function() {
      gui3.save();
    });
    dom.bind(button2, "click", function() {
      var presetName = prompt("Enter a new preset name.");
      if (presetName) {
        gui3.saveAs(presetName);
      }
    });
    dom.bind(button3, "click", function() {
      gui3.revert();
    });
  }
  function addResizeHandle(gui3) {
    var pmouseX = void 0;
    gui3.__resize_handle = document.createElement("div");
    Common.extend(gui3.__resize_handle.style, {
      width: "6px",
      marginLeft: "-3px",
      height: "200px",
      cursor: "ew-resize",
      position: "absolute"
    });
    function drag(e) {
      e.preventDefault();
      gui3.width += pmouseX - e.clientX;
      gui3.onResize();
      pmouseX = e.clientX;
      return false;
    }
    function dragStop() {
      dom.removeClass(gui3.__closeButton, GUI.CLASS_DRAG);
      dom.unbind(window, "mousemove", drag);
      dom.unbind(window, "mouseup", dragStop);
    }
    function dragStart(e) {
      e.preventDefault();
      pmouseX = e.clientX;
      dom.addClass(gui3.__closeButton, GUI.CLASS_DRAG);
      dom.bind(window, "mousemove", drag);
      dom.bind(window, "mouseup", dragStop);
      return false;
    }
    dom.bind(gui3.__resize_handle, "mousedown", dragStart);
    dom.bind(gui3.__closeButton, "mousedown", dragStart);
    gui3.domElement.insertBefore(gui3.__resize_handle, gui3.domElement.firstElementChild);
  }
  function setWidth(gui3, w) {
    gui3.domElement.style.width = w + "px";
    if (gui3.__save_row && gui3.autoPlace) {
      gui3.__save_row.style.width = w + "px";
    }
    if (gui3.__closeButton) {
      gui3.__closeButton.style.width = w + "px";
    }
  }
  function getCurrentPreset(gui3, useInitialValues) {
    var toReturn2 = {};
    Common.each(gui3.__rememberedObjects, function(val, index2) {
      var savedValues = {};
      var controllerMap = gui3.__rememberedObjectIndecesToControllers[index2];
      Common.each(controllerMap, function(controller, property) {
        savedValues[property] = useInitialValues ? controller.initialValue : controller.getValue();
      });
      toReturn2[index2] = savedValues;
    });
    return toReturn2;
  }
  function setPresetSelectIndex(gui3) {
    for (var index2 = 0; index2 < gui3.__preset_select.length; index2++) {
      if (gui3.__preset_select[index2].value === gui3.preset) {
        gui3.__preset_select.selectedIndex = index2;
      }
    }
  }
  function updateDisplays(controllerArray) {
    if (controllerArray.length !== 0) {
      requestAnimationFrame$1.call(window, function() {
        updateDisplays(controllerArray);
      });
    }
    Common.each(controllerArray, function(c) {
      c.updateDisplay();
    });
  }
  var color = {
    Color,
    math: ColorMath,
    interpret
  };
  var controllers = {
    Controller,
    BooleanController,
    OptionController,
    StringController,
    NumberController,
    NumberControllerBox,
    NumberControllerSlider,
    FunctionController,
    ColorController
  };
  var dom$1 = {dom};
  var gui = {GUI};
  var GUI$1 = GUI;
  var index = {
    color,
    controllers,
    dom: dom$1,
    gui,
    GUI: GUI$1
  };
  var dat_gui_module_default = index;

  // src/easing.ts
  const Easing = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => --t * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInQuart: (t) => t * t * t * t,
    easeOutQuart: (t) => 1 - --t * t * t * t,
    easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
    easeInQuint: (t) => t * t * t * t * t,
    easeOutQuint: (t) => 1 + --t * t * t * t * t,
    easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
  };
  const Compose = (...fs) => {
    const len = fs.length;
    if (len === 0)
      return (t) => t;
    if (len === 1)
      return fs[0];
    return (t) => {
      const index2 = Math.min(len - 1, Math.floor(t * len));
      return fs[index2](t * len - index2);
    };
  };
  const Invert = (f) => (t) => f(1 - t);
  const PingPong = (f) => Compose(f, Invert(f));
  var easing_default = Easing;

  // src/gui.ts
  class Gui {
    constructor(params) {
      this.listeners = {};
      this.config = params;
      this.gui = new dat_gui_module_default.GUI({load: JSON});
      const handle = (name) => (value) => {
        this.triggerChange(name, value);
      };
      const guiCanvas = this.gui.addFolder("Canvas");
      guiCanvas.add(params, "width").min(10).max(4096).step(1).onChange(handle("width"));
      guiCanvas.add(params, "height").min(10).max(4096).step(1).onChange(handle("height"));
      guiCanvas.add(params, "scale").min(1).max(4).step(1).onChange(handle("scale"));
      guiCanvas.add(params, "angle").min(0).max(360).onChange(handle("angle"));
      guiCanvas.open();
      const guiPattern = this.gui.addFolder("Pattern");
      guiPattern.add(params, "symmetries").min(4).max(32).step(1).onChange(handle("symmetries"));
      guiPattern.add(params, "patternScale").name("scale").min(0.05).max(4).step(0.05).onChange(handle("patternScale"));
      guiPattern.add(params, "patternAngle").name("angle").min(0).max(360).onChange(handle("patternAngle"));
      guiPattern.addColor(params, "offset").onChange(handle("offset"));
      guiPattern.add(params, "file").name("Load pattern...");
      guiPattern.add(params, "save").name("Save image...");
      guiPattern.add(params, "randomize").name("Randomize").onChange(() => {
        this.updateDisplay();
        this.triggerChange("randomize");
      });
      guiPattern.open();
      const guiAnimation = this.gui.addFolder("Animation");
      guiAnimation.add(params, "totalFrames").name("Total frames").min(1).max(600).step(1).onChange(handle("totalFrames"));
      guiAnimation.add(params, "fps").min(1).max(60).step(1).onChange(handle("fps"));
      guiAnimation.add(params, "pingPong").name("Ping pong");
      guiAnimation.add(params, "setStartFrame").name("Set current params as Start Frame");
      guiAnimation.add(params, "setEndFrame").name("Set current params as End Frame");
      guiAnimation.add(params, "easing", Object.keys(easing_default)).name("Easing");
      guiAnimation.add(params, "record").name("Record...").onChange(() => {
        this.updateDisplay();
        this.trigger("action", "record");
      });
      guiAnimation.open();
      this.gui.remember(this.config);
    }
    updateDisplay(gui3) {
      gui3 = gui3 || this.gui;
      for (var i in gui3.__controllers) {
        gui3.__controllers[i].updateDisplay();
      }
      for (var f in gui3.__folders) {
        this.updateDisplay(gui3.__folders[f]);
      }
    }
    addEventListener(eventName, eventCallback) {
      this.listeners[eventName] = this.listeners[eventName] || [];
      this.listeners[eventName].push(eventCallback);
    }
    removeEventListener(eventName, eventCallback) {
      this.listeners[eventName] = this.listeners[eventName] || [];
      this.listeners[eventName] = this.listeners[eventName].filter((callback) => callback !== eventCallback);
    }
    trigger(type, name, value) {
      this.listeners[type] && this.listeners[type].forEach((callback) => callback({type, name, value}));
    }
    triggerChange(name, value) {
      this.trigger("change", name, value);
    }
    getValue(name) {
      return this.config[name];
    }
    setValue(name, value) {
      const controller = this._findControllerFor(name);
      if (controller) {
        controller.setValue(value);
      }
    }
    increaseValue(name, value) {
      this.setValue(name, this.getValue(name) + value);
    }
    _findControllerFor(name) {
      let controller = this.gui.__controllers.find(function(elem) {
        return elem.property === name;
      });
      if (!controller) {
        controller = Object.keys(this.gui.__folders).reduce((result2, folderName) => {
          if (!result2) {
            result2 = this.gui.__folders[folderName].__controllers.find((elem) => elem.property === name);
          }
          return result2;
        }, void 0);
      }
      return controller;
    }
  }
  var gui_default = Gui;

  // src/config.ts
  function Config(params) {
    params = params || {};
    this.width = params.width || 2048;
    this.height = params.height || 2048;
    this.scale = params.scale || 4;
    this.angle = params.angle || 0;
    this.offset = params.offset || {h: 0, s: 0, v: 0};
    this.patternScale = params.patternScale || 1;
    this.patternAngle = params.patternAngle || 0;
    this.symmetries = params.symmetries || 7;
    this.file = () => document.getElementById("patternFile").click();
    this.save = () => {
      const a = document.createElement("a");
      a.download = "mandala.png";
      a.href = document.getElementById("stage").toDataURL("image/png").replace(/^data:image\/[^;]/, "data:application/octet-stream");
      a.click();
    };
    this.randomize = () => {
      this.angle = Math.floor(Math.random() * 360);
      this.offset.s = Math.random();
      this.offset.v = Math.random();
      this.patternScale = Math.random() * 4;
      this.patternAngle = Math.floor(Math.random() * 360);
      this.symmetries = Math.floor(Math.random() * 16) + 4;
    };
    this.snapshot = () => ({
      angle: this.angle,
      offset: {
        h: this.offset.h,
        s: this.offset.s,
        v: this.offset.v
      },
      patternScale: this.patternScale,
      patternAngle: this.patternAngle,
      symmetries: this.symmetries
    });
    this.totalFrames = params.totalFrames || 100;
    this.fps = params.fps || 30;
    this.record = () => {
    };
    this.startFrame = this.snapshot();
    this.setStartFrame = () => this.startFrame = this.snapshot();
    this.endFrame = this.snapshot();
    this.pingPong = false;
    this.setEndFrame = () => this.endFrame = this.snapshot();
    this.easing = "linear";
  }

  // src/video.ts
  const webm_writer = __toModule(require_browser());
  class Video {
    constructor(params = {}) {
      this.config = {
        quality: params.quality || 0.95,
        frameRate: params.frameRate || 30,
        transparent: false,
        alphaQuality: void 0
      };
      this.reset();
    }
    reset() {
      this.video = new webm_writer.default(this.config);
    }
    save(filename = "mandala.webm") {
      this.video.complete().then((blob) => {
        const anchor = document.createElement("a");
        anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
        anchor.download = filename;
        anchor.click();
      });
    }
    addFrame(canvas) {
      this.video.addFrame(canvas);
    }
  }
  var video_default = Video;

  // src/recorder.ts
  class Recorder {
    record(mandala2, stage2, config2) {
      this.mandala = mandala2;
      this.stage = stage2;
      this.video = new video_default({frameRate: config2.fps});
      this.easing = easing_default[config2.easing];
      if (config2.pingPong) {
        this.easing = PingPong(this.easing);
      }
      this.from = config2.startFrame;
      this.to = config2.endFrame;
      this.currentFrame = 0;
      this.totalFrames = config2.totalFrames;
      return new Promise((resolve) => {
        this.resolve = resolve;
        this.render();
      });
    }
    interpolate(from, to, t) {
      const k = this.easing(t);
      return {
        angle: (to.angle - from.angle) * k + from.angle,
        offset: {
          s: (to.offset.s - from.offset.s) * k + from.offset.s,
          v: (to.offset.v - from.offset.v) * k + from.offset.v
        },
        patternScale: (to.patternScale - from.patternScale) * k + from.patternScale,
        patternAngle: (to.patternAngle - from.patternAngle) * k + from.patternAngle,
        symmetries: (to.symmetries - from.symmetries) * k + from.symmetries
      };
    }
    render() {
      clearTimeout(this.renderTimeout);
      this.renderTimeout = setTimeout(() => {
        let t = this.currentFrame / this.totalFrames;
        this.currentFrame++;
        const params = this.interpolate(this.from, this.to, t);
        this.stage.clear();
        this.mandala.setScale(params.patternScale);
        this.mandala.setRotation(params.patternAngle);
        this.mandala.render(this.stage.ctx, params);
        this.video.addFrame(this.stage.ctx.canvas);
        if (t < 1) {
          this.render();
        } else {
          this.video.save();
          this.resolve();
        }
      }, 1);
    }
  }
  var recorder_default = Recorder;

  // src/helpers.ts
  const on = (context, eventType, eventCallback, useCapture) => {
    if (context && eventType && eventCallback) {
      var events = String(eventType).split(" ");
      while (events.length) {
        eventType = events.pop();
        if (context.addEventListener) {
          context.addEventListener(eventType, eventCallback, useCapture);
        } else {
          context.attachEvent("on" + eventType, eventCallback, useCapture);
        }
      }
    }
  };

  // src/main.ts
  class MandalaApp {
    constructor(node) {
      const canvas = document.querySelector(node);
      this.config = new Config();
      this.gui = new gui_default(this.config);
      this.mandala = new mandala_default();
      this.recorder = new recorder_default();
      this.stage = new stage_default(canvas);
      this.stage.clear("white");
      this.stage.setScale(this.gui.getValue("scale"));
      this.stage.drawText("DROP IMAGE HERE");
      this.bindEvents();
    }
    bindEvents() {
      let isDragging = false;
      on(document.getElementById("patternFile"), "change", (e) => {
        this.onFileChange(e.target.files[0]);
      });
      on(this.stage.canvas, "mousedown", (e) => {
        if (e.button === 0) {
          isDragging = true;
        }
      });
      on(document, "mouseup", (e) => {
        isDragging = false;
      });
      on(document, "mousemove", (e) => {
        if (!isDragging) {
          return;
        }
        if (e.shiftKey) {
          this.gui.increaseValue("angle", e.movementX / 10);
        } else if (e.altKey) {
          this.gui.increaseValue("patternAngle", e.movementX / 10);
        } else {
          const offset = this.gui.getValue("offset");
          this.gui.setValue("offset", {
            s: offset.s - e.movementY / this.stage.height,
            v: offset.v - e.movementX / this.stage.width
          });
        }
      });
      const lastPosition = {x: void 0, y: void 0};
      on(this.stage.canvas, "touchstart", (e) => {
        isDragging = true;
        const touch = event.changedTouches[0];
        lastPosition.x = touch.clientX;
        lastPosition.y = touch.clientY;
      });
      on(document, "touchend touchcancel", (e) => {
        isDragging = false;
      });
      on(document, "touchmove", (e) => {
        if (!isDragging) {
          return;
        }
        const touch = event.changedTouches[0];
        const movementX = touch.clientX - lastPosition.x;
        const movementY = touch.clientY - lastPosition.y;
        lastPosition.x = touch.clientX;
        lastPosition.y = touch.clientY;
        const offset = this.gui.getValue("offset");
        this.gui.setValue("offset", {
          s: offset.s - movementY / this.stage.height,
          v: offset.v - movementX / this.stage.width
        });
      });
      on(this.stage.canvas, "wheel", (e) => {
        e.preventDefault();
        this.gui.increaseValue("patternScale", e.deltaY * -1e-3);
      });
      on(window, "dragover", (e) => e.preventDefault());
      on(window, "drop", (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        this.onFileChange(file);
      });
      on(this.gui, "change", ({name, value}) => {
        switch (name) {
          case "patternAngle":
            this.mandala.setRotation(value);
            break;
          case "patternScale":
            this.mandala.setScale(value);
            break;
          case "scale":
            this.stage.setScale(value);
            break;
          case "width":
            this.stage.setWidth(value);
            break;
          case "height":
            this.stage.setHeight(value);
            break;
          case "randomize":
            this.mandala.setScale(this.config.patternScale);
            this.mandala.setRotation(this.config.patternRotation);
            break;
        }
        this.render();
      });
      on(this.gui, "action", ({name, value}) => {
        switch (name) {
          case "record":
            this.recorder.record(this.mandala, this.stage, this.config).then(() => this.gui.updateDisplay());
            break;
        }
      });
    }
    onFileChange(file) {
      if (!file) {
        return;
      }
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.addEventListener("load", () => {
        this.mandala.setPattern(this.stage.ctx.createPattern(img, "repeat"));
        this.render();
      });
    }
    render() {
      clearTimeout(this.renderTimeout);
      this.renderTimeout = setTimeout(() => {
        this.stage.clear();
        this.mandala.render(this.stage.ctx, this.config);
      }, 1);
    }
  }
  window.MandalaApp = MandalaApp;
})();
//# sourceMappingURL=bundle.js.map
