(() => {
  // node_modules/@firebase/util/dist/index.esm2017.js
  var stringToByteArray$1 = function(str) {
    const out = [];
    let p2 = 0;
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i);
      if (c < 128) {
        out[p2++] = c;
      } else if (c < 2048) {
        out[p2++] = c >> 6 | 192;
        out[p2++] = c & 63 | 128;
      } else if ((c & 64512) === 55296 && i + 1 < str.length && (str.charCodeAt(i + 1) & 64512) === 56320) {
        c = 65536 + ((c & 1023) << 10) + (str.charCodeAt(++i) & 1023);
        out[p2++] = c >> 18 | 240;
        out[p2++] = c >> 12 & 63 | 128;
        out[p2++] = c >> 6 & 63 | 128;
        out[p2++] = c & 63 | 128;
      } else {
        out[p2++] = c >> 12 | 224;
        out[p2++] = c >> 6 & 63 | 128;
        out[p2++] = c & 63 | 128;
      }
    }
    return out;
  };
  var byteArrayToString = function(bytes) {
    const out = [];
    let pos = 0, c = 0;
    while (pos < bytes.length) {
      const c1 = bytes[pos++];
      if (c1 < 128) {
        out[c++] = String.fromCharCode(c1);
      } else if (c1 > 191 && c1 < 224) {
        const c2 = bytes[pos++];
        out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
      } else if (c1 > 239 && c1 < 365) {
        const c2 = bytes[pos++];
        const c3 = bytes[pos++];
        const c4 = bytes[pos++];
        const u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) - 65536;
        out[c++] = String.fromCharCode(55296 + (u >> 10));
        out[c++] = String.fromCharCode(56320 + (u & 1023));
      } else {
        const c2 = bytes[pos++];
        const c3 = bytes[pos++];
        out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
      }
    }
    return out.join("");
  };
  var base64 = {
    /**
     * Maps bytes to characters.
     */
    byteToCharMap_: null,
    /**
     * Maps characters to bytes.
     */
    charToByteMap_: null,
    /**
     * Maps bytes to websafe characters.
     * @private
     */
    byteToCharMapWebSafe_: null,
    /**
     * Maps websafe characters to bytes.
     * @private
     */
    charToByteMapWebSafe_: null,
    /**
     * Our default alphabet, shared between
     * ENCODED_VALS and ENCODED_VALS_WEBSAFE
     */
    ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    /**
     * Our default alphabet. Value 64 (=) is special; it means "nothing."
     */
    get ENCODED_VALS() {
      return this.ENCODED_VALS_BASE + "+/=";
    },
    /**
     * Our websafe alphabet.
     */
    get ENCODED_VALS_WEBSAFE() {
      return this.ENCODED_VALS_BASE + "-_.";
    },
    /**
     * Whether this browser supports the atob and btoa functions. This extension
     * started at Mozilla but is now implemented by many browsers. We use the
     * ASSUME_* variables to avoid pulling in the full useragent detection library
     * but still allowing the standard per-browser compilations.
     *
     */
    HAS_NATIVE_SUPPORT: typeof atob === "function",
    /**
     * Base64-encode an array of bytes.
     *
     * @param input An array of bytes (numbers with
     *     value in [0, 255]) to encode.
     * @param webSafe Boolean indicating we should use the
     *     alternative alphabet.
     * @return The base64 encoded string.
     */
    encodeByteArray(input, webSafe) {
      if (!Array.isArray(input)) {
        throw Error("encodeByteArray takes an array as a parameter");
      }
      this.init_();
      const byteToCharMap = webSafe ? this.byteToCharMapWebSafe_ : this.byteToCharMap_;
      const output = [];
      for (let i = 0; i < input.length; i += 3) {
        const byte1 = input[i];
        const haveByte2 = i + 1 < input.length;
        const byte2 = haveByte2 ? input[i + 1] : 0;
        const haveByte3 = i + 2 < input.length;
        const byte3 = haveByte3 ? input[i + 2] : 0;
        const outByte1 = byte1 >> 2;
        const outByte2 = (byte1 & 3) << 4 | byte2 >> 4;
        let outByte3 = (byte2 & 15) << 2 | byte3 >> 6;
        let outByte4 = byte3 & 63;
        if (!haveByte3) {
          outByte4 = 64;
          if (!haveByte2) {
            outByte3 = 64;
          }
        }
        output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
      }
      return output.join("");
    },
    /**
     * Base64-encode a string.
     *
     * @param input A string to encode.
     * @param webSafe If true, we should use the
     *     alternative alphabet.
     * @return The base64 encoded string.
     */
    encodeString(input, webSafe) {
      if (this.HAS_NATIVE_SUPPORT && !webSafe) {
        return btoa(input);
      }
      return this.encodeByteArray(stringToByteArray$1(input), webSafe);
    },
    /**
     * Base64-decode a string.
     *
     * @param input to decode.
     * @param webSafe True if we should use the
     *     alternative alphabet.
     * @return string representing the decoded value.
     */
    decodeString(input, webSafe) {
      if (this.HAS_NATIVE_SUPPORT && !webSafe) {
        return atob(input);
      }
      return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
    },
    /**
     * Base64-decode a string.
     *
     * In base-64 decoding, groups of four characters are converted into three
     * bytes.  If the encoder did not apply padding, the input length may not
     * be a multiple of 4.
     *
     * In this case, the last group will have fewer than 4 characters, and
     * padding will be inferred.  If the group has one or two characters, it decodes
     * to one byte.  If the group has three characters, it decodes to two bytes.
     *
     * @param input Input to decode.
     * @param webSafe True if we should use the web-safe alphabet.
     * @return bytes representing the decoded value.
     */
    decodeStringToByteArray(input, webSafe) {
      this.init_();
      const charToByteMap = webSafe ? this.charToByteMapWebSafe_ : this.charToByteMap_;
      const output = [];
      for (let i = 0; i < input.length; ) {
        const byte1 = charToByteMap[input.charAt(i++)];
        const haveByte2 = i < input.length;
        const byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0;
        ++i;
        const haveByte3 = i < input.length;
        const byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 64;
        ++i;
        const haveByte4 = i < input.length;
        const byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 64;
        ++i;
        if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) {
          throw new DecodeBase64StringError();
        }
        const outByte1 = byte1 << 2 | byte2 >> 4;
        output.push(outByte1);
        if (byte3 !== 64) {
          const outByte2 = byte2 << 4 & 240 | byte3 >> 2;
          output.push(outByte2);
          if (byte4 !== 64) {
            const outByte3 = byte3 << 6 & 192 | byte4;
            output.push(outByte3);
          }
        }
      }
      return output;
    },
    /**
     * Lazy static initialization function. Called before
     * accessing any of the static map variables.
     * @private
     */
    init_() {
      if (!this.byteToCharMap_) {
        this.byteToCharMap_ = {};
        this.charToByteMap_ = {};
        this.byteToCharMapWebSafe_ = {};
        this.charToByteMapWebSafe_ = {};
        for (let i = 0; i < this.ENCODED_VALS.length; i++) {
          this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
          this.charToByteMap_[this.byteToCharMap_[i]] = i;
          this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
          this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
          if (i >= this.ENCODED_VALS_BASE.length) {
            this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
            this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
          }
        }
      }
    }
  };
  var DecodeBase64StringError = class extends Error {
    constructor() {
      super(...arguments);
      this.name = "DecodeBase64StringError";
    }
  };
  var base64Encode = function(str) {
    const utf8Bytes = stringToByteArray$1(str);
    return base64.encodeByteArray(utf8Bytes, true);
  };
  var base64urlEncodeWithoutPadding = function(str) {
    return base64Encode(str).replace(/\./g, "");
  };
  var base64Decode = function(str) {
    try {
      return base64.decodeString(str, true);
    } catch (e) {
      console.error("base64Decode failed: ", e);
    }
    return null;
  };
  function getGlobal() {
    if (typeof self !== "undefined") {
      return self;
    }
    if (typeof window !== "undefined") {
      return window;
    }
    if (typeof global !== "undefined") {
      return global;
    }
    throw new Error("Unable to locate global object.");
  }
  var getDefaultsFromGlobal = () => getGlobal().__FIREBASE_DEFAULTS__;
  var getDefaultsFromEnvVariable = () => {
    if (typeof process === "undefined" || typeof process.env === "undefined") {
      return;
    }
    const defaultsJsonString = process.env.__FIREBASE_DEFAULTS__;
    if (defaultsJsonString) {
      return JSON.parse(defaultsJsonString);
    }
  };
  var getDefaultsFromCookie = () => {
    if (typeof document === "undefined") {
      return;
    }
    let match;
    try {
      match = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
    } catch (e) {
      return;
    }
    const decoded = match && base64Decode(match[1]);
    return decoded && JSON.parse(decoded);
  };
  var getDefaults = () => {
    try {
      return getDefaultsFromGlobal() || getDefaultsFromEnvVariable() || getDefaultsFromCookie();
    } catch (e) {
      console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);
      return;
    }
  };
  var getDefaultEmulatorHost = (productName) => {
    var _a, _b;
    return (_b = (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a.emulatorHosts) === null || _b === void 0 ? void 0 : _b[productName];
  };
  var getDefaultEmulatorHostnameAndPort = (productName) => {
    const host = getDefaultEmulatorHost(productName);
    if (!host) {
      return void 0;
    }
    const separatorIndex = host.lastIndexOf(":");
    if (separatorIndex <= 0 || separatorIndex + 1 === host.length) {
      throw new Error(`Invalid host ${host} with no separate hostname and port!`);
    }
    const port = parseInt(host.substring(separatorIndex + 1), 10);
    if (host[0] === "[") {
      return [host.substring(1, separatorIndex - 1), port];
    } else {
      return [host.substring(0, separatorIndex), port];
    }
  };
  var getDefaultAppConfig = () => {
    var _a;
    return (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a.config;
  };
  var Deferred = class {
    constructor() {
      this.reject = () => {
      };
      this.resolve = () => {
      };
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    }
    /**
     * Our API internals are not promiseified and cannot because our callback APIs have subtle expectations around
     * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
     * and returns a node-style callback which will resolve or reject the Deferred's promise.
     */
    wrapCallback(callback) {
      return (error, value) => {
        if (error) {
          this.reject(error);
        } else {
          this.resolve(value);
        }
        if (typeof callback === "function") {
          this.promise.catch(() => {
          });
          if (callback.length === 1) {
            callback(error);
          } else {
            callback(error, value);
          }
        }
      };
    }
  };
  function createMockUserToken(token, projectId) {
    if (token.uid) {
      throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');
    }
    const header = {
      alg: "none",
      type: "JWT"
    };
    const project = projectId || "demo-project";
    const iat = token.iat || 0;
    const sub = token.sub || token.user_id;
    if (!sub) {
      throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");
    }
    const payload = Object.assign({
      // Set all required fields to decent defaults
      iss: `https://securetoken.google.com/${project}`,
      aud: project,
      iat,
      exp: iat + 3600,
      auth_time: iat,
      sub,
      user_id: sub,
      firebase: {
        sign_in_provider: "custom",
        identities: {}
      }
    }, token);
    const signature = "";
    return [
      base64urlEncodeWithoutPadding(JSON.stringify(header)),
      base64urlEncodeWithoutPadding(JSON.stringify(payload)),
      signature
    ].join(".");
  }
  function isIndexedDBAvailable() {
    try {
      return typeof indexedDB === "object";
    } catch (e) {
      return false;
    }
  }
  function validateIndexedDBOpenable() {
    return new Promise((resolve, reject) => {
      try {
        let preExist = true;
        const DB_CHECK_NAME = "validate-browser-context-for-indexeddb-analytics-module";
        const request = self.indexedDB.open(DB_CHECK_NAME);
        request.onsuccess = () => {
          request.result.close();
          if (!preExist) {
            self.indexedDB.deleteDatabase(DB_CHECK_NAME);
          }
          resolve(true);
        };
        request.onupgradeneeded = () => {
          preExist = false;
        };
        request.onerror = () => {
          var _a;
          reject(((_a = request.error) === null || _a === void 0 ? void 0 : _a.message) || "");
        };
      } catch (error) {
        reject(error);
      }
    });
  }
  var ERROR_NAME = "FirebaseError";
  var FirebaseError = class _FirebaseError extends Error {
    constructor(code, message, customData) {
      super(message);
      this.code = code;
      this.customData = customData;
      this.name = ERROR_NAME;
      Object.setPrototypeOf(this, _FirebaseError.prototype);
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, ErrorFactory.prototype.create);
      }
    }
  };
  var ErrorFactory = class {
    constructor(service, serviceName, errors) {
      this.service = service;
      this.serviceName = serviceName;
      this.errors = errors;
    }
    create(code, ...data) {
      const customData = data[0] || {};
      const fullCode = `${this.service}/${code}`;
      const template = this.errors[code];
      const message = template ? replaceTemplate(template, customData) : "Error";
      const fullMessage = `${this.serviceName}: ${message} (${fullCode}).`;
      const error = new FirebaseError(fullCode, fullMessage, customData);
      return error;
    }
  };
  function replaceTemplate(template, data) {
    return template.replace(PATTERN, (_, key) => {
      const value = data[key];
      return value != null ? String(value) : `<${key}?>`;
    });
  }
  var PATTERN = /\{\$([^}]+)}/g;
  function deepEqual(a, b2) {
    if (a === b2) {
      return true;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b2);
    for (const k2 of aKeys) {
      if (!bKeys.includes(k2)) {
        return false;
      }
      const aProp = a[k2];
      const bProp = b2[k2];
      if (isObject(aProp) && isObject(bProp)) {
        if (!deepEqual(aProp, bProp)) {
          return false;
        }
      } else if (aProp !== bProp) {
        return false;
      }
    }
    for (const k2 of bKeys) {
      if (!aKeys.includes(k2)) {
        return false;
      }
    }
    return true;
  }
  function isObject(thing) {
    return thing !== null && typeof thing === "object";
  }
  var MAX_VALUE_MILLIS = 4 * 60 * 60 * 1e3;
  function getModularInstance(service) {
    if (service && service._delegate) {
      return service._delegate;
    } else {
      return service;
    }
  }

  // node_modules/@firebase/component/dist/esm/index.esm2017.js
  var Component = class {
    /**
     *
     * @param name The public service name, e.g. app, auth, firestore, database
     * @param instanceFactory Service factory responsible for creating the public interface
     * @param type whether the service provided by the component is public or private
     */
    constructor(name3, instanceFactory, type) {
      this.name = name3;
      this.instanceFactory = instanceFactory;
      this.type = type;
      this.multipleInstances = false;
      this.serviceProps = {};
      this.instantiationMode = "LAZY";
      this.onInstanceCreated = null;
    }
    setInstantiationMode(mode) {
      this.instantiationMode = mode;
      return this;
    }
    setMultipleInstances(multipleInstances) {
      this.multipleInstances = multipleInstances;
      return this;
    }
    setServiceProps(props) {
      this.serviceProps = props;
      return this;
    }
    setInstanceCreatedCallback(callback) {
      this.onInstanceCreated = callback;
      return this;
    }
  };
  var DEFAULT_ENTRY_NAME = "[DEFAULT]";
  var Provider = class {
    constructor(name3, container) {
      this.name = name3;
      this.container = container;
      this.component = null;
      this.instances = /* @__PURE__ */ new Map();
      this.instancesDeferred = /* @__PURE__ */ new Map();
      this.instancesOptions = /* @__PURE__ */ new Map();
      this.onInitCallbacks = /* @__PURE__ */ new Map();
    }
    /**
     * @param identifier A provider can provide mulitple instances of a service
     * if this.component.multipleInstances is true.
     */
    get(identifier) {
      const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
      if (!this.instancesDeferred.has(normalizedIdentifier)) {
        const deferred = new Deferred();
        this.instancesDeferred.set(normalizedIdentifier, deferred);
        if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) {
          try {
            const instance = this.getOrInitializeService({
              instanceIdentifier: normalizedIdentifier
            });
            if (instance) {
              deferred.resolve(instance);
            }
          } catch (e) {
          }
        }
      }
      return this.instancesDeferred.get(normalizedIdentifier).promise;
    }
    getImmediate(options) {
      var _a;
      const normalizedIdentifier = this.normalizeInstanceIdentifier(options === null || options === void 0 ? void 0 : options.identifier);
      const optional = (_a = options === null || options === void 0 ? void 0 : options.optional) !== null && _a !== void 0 ? _a : false;
      if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) {
        try {
          return this.getOrInitializeService({
            instanceIdentifier: normalizedIdentifier
          });
        } catch (e) {
          if (optional) {
            return null;
          } else {
            throw e;
          }
        }
      } else {
        if (optional) {
          return null;
        } else {
          throw Error(`Service ${this.name} is not available`);
        }
      }
    }
    getComponent() {
      return this.component;
    }
    setComponent(component) {
      if (component.name !== this.name) {
        throw Error(`Mismatching Component ${component.name} for Provider ${this.name}.`);
      }
      if (this.component) {
        throw Error(`Component for ${this.name} has already been provided`);
      }
      this.component = component;
      if (!this.shouldAutoInitialize()) {
        return;
      }
      if (isComponentEager(component)) {
        try {
          this.getOrInitializeService({ instanceIdentifier: DEFAULT_ENTRY_NAME });
        } catch (e) {
        }
      }
      for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
        const normalizedIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
        try {
          const instance = this.getOrInitializeService({
            instanceIdentifier: normalizedIdentifier
          });
          instanceDeferred.resolve(instance);
        } catch (e) {
        }
      }
    }
    clearInstance(identifier = DEFAULT_ENTRY_NAME) {
      this.instancesDeferred.delete(identifier);
      this.instancesOptions.delete(identifier);
      this.instances.delete(identifier);
    }
    // app.delete() will call this method on every provider to delete the services
    // TODO: should we mark the provider as deleted?
    async delete() {
      const services = Array.from(this.instances.values());
      await Promise.all([
        ...services.filter((service) => "INTERNAL" in service).map((service) => service.INTERNAL.delete()),
        ...services.filter((service) => "_delete" in service).map((service) => service._delete())
      ]);
    }
    isComponentSet() {
      return this.component != null;
    }
    isInitialized(identifier = DEFAULT_ENTRY_NAME) {
      return this.instances.has(identifier);
    }
    getOptions(identifier = DEFAULT_ENTRY_NAME) {
      return this.instancesOptions.get(identifier) || {};
    }
    initialize(opts = {}) {
      const { options = {} } = opts;
      const normalizedIdentifier = this.normalizeInstanceIdentifier(opts.instanceIdentifier);
      if (this.isInitialized(normalizedIdentifier)) {
        throw Error(`${this.name}(${normalizedIdentifier}) has already been initialized`);
      }
      if (!this.isComponentSet()) {
        throw Error(`Component ${this.name} has not been registered yet`);
      }
      const instance = this.getOrInitializeService({
        instanceIdentifier: normalizedIdentifier,
        options
      });
      for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
        const normalizedDeferredIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
        if (normalizedIdentifier === normalizedDeferredIdentifier) {
          instanceDeferred.resolve(instance);
        }
      }
      return instance;
    }
    /**
     *
     * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
     * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
     *
     * @param identifier An optional instance identifier
     * @returns a function to unregister the callback
     */
    onInit(callback, identifier) {
      var _a;
      const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
      const existingCallbacks = (_a = this.onInitCallbacks.get(normalizedIdentifier)) !== null && _a !== void 0 ? _a : /* @__PURE__ */ new Set();
      existingCallbacks.add(callback);
      this.onInitCallbacks.set(normalizedIdentifier, existingCallbacks);
      const existingInstance = this.instances.get(normalizedIdentifier);
      if (existingInstance) {
        callback(existingInstance, normalizedIdentifier);
      }
      return () => {
        existingCallbacks.delete(callback);
      };
    }
    /**
     * Invoke onInit callbacks synchronously
     * @param instance the service instance`
     */
    invokeOnInitCallbacks(instance, identifier) {
      const callbacks = this.onInitCallbacks.get(identifier);
      if (!callbacks) {
        return;
      }
      for (const callback of callbacks) {
        try {
          callback(instance, identifier);
        } catch (_a) {
        }
      }
    }
    getOrInitializeService({ instanceIdentifier, options = {} }) {
      let instance = this.instances.get(instanceIdentifier);
      if (!instance && this.component) {
        instance = this.component.instanceFactory(this.container, {
          instanceIdentifier: normalizeIdentifierForFactory(instanceIdentifier),
          options
        });
        this.instances.set(instanceIdentifier, instance);
        this.instancesOptions.set(instanceIdentifier, options);
        this.invokeOnInitCallbacks(instance, instanceIdentifier);
        if (this.component.onInstanceCreated) {
          try {
            this.component.onInstanceCreated(this.container, instanceIdentifier, instance);
          } catch (_a) {
          }
        }
      }
      return instance || null;
    }
    normalizeInstanceIdentifier(identifier = DEFAULT_ENTRY_NAME) {
      if (this.component) {
        return this.component.multipleInstances ? identifier : DEFAULT_ENTRY_NAME;
      } else {
        return identifier;
      }
    }
    shouldAutoInitialize() {
      return !!this.component && this.component.instantiationMode !== "EXPLICIT";
    }
  };
  function normalizeIdentifierForFactory(identifier) {
    return identifier === DEFAULT_ENTRY_NAME ? void 0 : identifier;
  }
  function isComponentEager(component) {
    return component.instantiationMode === "EAGER";
  }
  var ComponentContainer = class {
    constructor(name3) {
      this.name = name3;
      this.providers = /* @__PURE__ */ new Map();
    }
    /**
     *
     * @param component Component being added
     * @param overwrite When a component with the same name has already been registered,
     * if overwrite is true: overwrite the existing component with the new component and create a new
     * provider with the new component. It can be useful in tests where you want to use different mocks
     * for different tests.
     * if overwrite is false: throw an exception
     */
    addComponent(component) {
      const provider = this.getProvider(component.name);
      if (provider.isComponentSet()) {
        throw new Error(`Component ${component.name} has already been registered with ${this.name}`);
      }
      provider.setComponent(component);
    }
    addOrOverwriteComponent(component) {
      const provider = this.getProvider(component.name);
      if (provider.isComponentSet()) {
        this.providers.delete(component.name);
      }
      this.addComponent(component);
    }
    /**
     * getProvider provides a type safe interface where it can only be called with a field name
     * present in NameServiceMapping interface.
     *
     * Firebase SDKs providing services should extend NameServiceMapping interface to register
     * themselves.
     */
    getProvider(name3) {
      if (this.providers.has(name3)) {
        return this.providers.get(name3);
      }
      const provider = new Provider(name3, this);
      this.providers.set(name3, provider);
      return provider;
    }
    getProviders() {
      return Array.from(this.providers.values());
    }
  };

  // node_modules/@firebase/logger/dist/esm/index.esm2017.js
  var instances = [];
  var LogLevel;
  (function(LogLevel2) {
    LogLevel2[LogLevel2["DEBUG"] = 0] = "DEBUG";
    LogLevel2[LogLevel2["VERBOSE"] = 1] = "VERBOSE";
    LogLevel2[LogLevel2["INFO"] = 2] = "INFO";
    LogLevel2[LogLevel2["WARN"] = 3] = "WARN";
    LogLevel2[LogLevel2["ERROR"] = 4] = "ERROR";
    LogLevel2[LogLevel2["SILENT"] = 5] = "SILENT";
  })(LogLevel || (LogLevel = {}));
  var levelStringToEnum = {
    "debug": LogLevel.DEBUG,
    "verbose": LogLevel.VERBOSE,
    "info": LogLevel.INFO,
    "warn": LogLevel.WARN,
    "error": LogLevel.ERROR,
    "silent": LogLevel.SILENT
  };
  var defaultLogLevel = LogLevel.INFO;
  var ConsoleMethod = {
    [LogLevel.DEBUG]: "log",
    [LogLevel.VERBOSE]: "log",
    [LogLevel.INFO]: "info",
    [LogLevel.WARN]: "warn",
    [LogLevel.ERROR]: "error"
  };
  var defaultLogHandler = (instance, logType, ...args) => {
    if (logType < instance.logLevel) {
      return;
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const method = ConsoleMethod[logType];
    if (method) {
      console[method](`[${now}]  ${instance.name}:`, ...args);
    } else {
      throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
    }
  };
  var Logger = class {
    /**
     * Gives you an instance of a Logger to capture messages according to
     * Firebase's logging scheme.
     *
     * @param name The name that the logs will be associated with
     */
    constructor(name3) {
      this.name = name3;
      this._logLevel = defaultLogLevel;
      this._logHandler = defaultLogHandler;
      this._userLogHandler = null;
      instances.push(this);
    }
    get logLevel() {
      return this._logLevel;
    }
    set logLevel(val) {
      if (!(val in LogLevel)) {
        throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
      }
      this._logLevel = val;
    }
    // Workaround for setter/getter having to be the same type.
    setLogLevel(val) {
      this._logLevel = typeof val === "string" ? levelStringToEnum[val] : val;
    }
    get logHandler() {
      return this._logHandler;
    }
    set logHandler(val) {
      if (typeof val !== "function") {
        throw new TypeError("Value assigned to `logHandler` must be a function");
      }
      this._logHandler = val;
    }
    get userLogHandler() {
      return this._userLogHandler;
    }
    set userLogHandler(val) {
      this._userLogHandler = val;
    }
    /**
     * The functions below are all based on the `console` interface
     */
    debug(...args) {
      this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
      this._logHandler(this, LogLevel.DEBUG, ...args);
    }
    log(...args) {
      this._userLogHandler && this._userLogHandler(this, LogLevel.VERBOSE, ...args);
      this._logHandler(this, LogLevel.VERBOSE, ...args);
    }
    info(...args) {
      this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
      this._logHandler(this, LogLevel.INFO, ...args);
    }
    warn(...args) {
      this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
      this._logHandler(this, LogLevel.WARN, ...args);
    }
    error(...args) {
      this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
      this._logHandler(this, LogLevel.ERROR, ...args);
    }
  };

  // node_modules/idb/build/wrap-idb-value.js
  var instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);
  var idbProxyableTypes;
  var cursorAdvanceMethods;
  function getIdbProxyableTypes() {
    return idbProxyableTypes || (idbProxyableTypes = [
      IDBDatabase,
      IDBObjectStore,
      IDBIndex,
      IDBCursor,
      IDBTransaction
    ]);
  }
  function getCursorAdvanceMethods() {
    return cursorAdvanceMethods || (cursorAdvanceMethods = [
      IDBCursor.prototype.advance,
      IDBCursor.prototype.continue,
      IDBCursor.prototype.continuePrimaryKey
    ]);
  }
  var cursorRequestMap = /* @__PURE__ */ new WeakMap();
  var transactionDoneMap = /* @__PURE__ */ new WeakMap();
  var transactionStoreNamesMap = /* @__PURE__ */ new WeakMap();
  var transformCache = /* @__PURE__ */ new WeakMap();
  var reverseTransformCache = /* @__PURE__ */ new WeakMap();
  function promisifyRequest(request) {
    const promise = new Promise((resolve, reject) => {
      const unlisten = () => {
        request.removeEventListener("success", success);
        request.removeEventListener("error", error);
      };
      const success = () => {
        resolve(wrap(request.result));
        unlisten();
      };
      const error = () => {
        reject(request.error);
        unlisten();
      };
      request.addEventListener("success", success);
      request.addEventListener("error", error);
    });
    promise.then((value) => {
      if (value instanceof IDBCursor) {
        cursorRequestMap.set(value, request);
      }
    }).catch(() => {
    });
    reverseTransformCache.set(promise, request);
    return promise;
  }
  function cacheDonePromiseForTransaction(tx) {
    if (transactionDoneMap.has(tx))
      return;
    const done = new Promise((resolve, reject) => {
      const unlisten = () => {
        tx.removeEventListener("complete", complete);
        tx.removeEventListener("error", error);
        tx.removeEventListener("abort", error);
      };
      const complete = () => {
        resolve();
        unlisten();
      };
      const error = () => {
        reject(tx.error || new DOMException("AbortError", "AbortError"));
        unlisten();
      };
      tx.addEventListener("complete", complete);
      tx.addEventListener("error", error);
      tx.addEventListener("abort", error);
    });
    transactionDoneMap.set(tx, done);
  }
  var idbProxyTraps = {
    get(target, prop, receiver) {
      if (target instanceof IDBTransaction) {
        if (prop === "done")
          return transactionDoneMap.get(target);
        if (prop === "objectStoreNames") {
          return target.objectStoreNames || transactionStoreNamesMap.get(target);
        }
        if (prop === "store") {
          return receiver.objectStoreNames[1] ? void 0 : receiver.objectStore(receiver.objectStoreNames[0]);
        }
      }
      return wrap(target[prop]);
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
    has(target, prop) {
      if (target instanceof IDBTransaction && (prop === "done" || prop === "store")) {
        return true;
      }
      return prop in target;
    }
  };
  function replaceTraps(callback) {
    idbProxyTraps = callback(idbProxyTraps);
  }
  function wrapFunction(func) {
    if (func === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype)) {
      return function(storeNames, ...args) {
        const tx = func.call(unwrap(this), storeNames, ...args);
        transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
        return wrap(tx);
      };
    }
    if (getCursorAdvanceMethods().includes(func)) {
      return function(...args) {
        func.apply(unwrap(this), args);
        return wrap(cursorRequestMap.get(this));
      };
    }
    return function(...args) {
      return wrap(func.apply(unwrap(this), args));
    };
  }
  function transformCachableValue(value) {
    if (typeof value === "function")
      return wrapFunction(value);
    if (value instanceof IDBTransaction)
      cacheDonePromiseForTransaction(value);
    if (instanceOfAny(value, getIdbProxyableTypes()))
      return new Proxy(value, idbProxyTraps);
    return value;
  }
  function wrap(value) {
    if (value instanceof IDBRequest)
      return promisifyRequest(value);
    if (transformCache.has(value))
      return transformCache.get(value);
    const newValue = transformCachableValue(value);
    if (newValue !== value) {
      transformCache.set(value, newValue);
      reverseTransformCache.set(newValue, value);
    }
    return newValue;
  }
  var unwrap = (value) => reverseTransformCache.get(value);

  // node_modules/idb/build/index.js
  function openDB(name3, version3, { blocked, upgrade, blocking, terminated } = {}) {
    const request = indexedDB.open(name3, version3);
    const openPromise = wrap(request);
    if (upgrade) {
      request.addEventListener("upgradeneeded", (event) => {
        upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
      });
    }
    if (blocked) {
      request.addEventListener("blocked", (event) => blocked(
        // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
        event.oldVersion,
        event.newVersion,
        event
      ));
    }
    openPromise.then((db) => {
      if (terminated)
        db.addEventListener("close", () => terminated());
      if (blocking) {
        db.addEventListener("versionchange", (event) => blocking(event.oldVersion, event.newVersion, event));
      }
    }).catch(() => {
    });
    return openPromise;
  }
  var readMethods = ["get", "getKey", "getAll", "getAllKeys", "count"];
  var writeMethods = ["put", "add", "delete", "clear"];
  var cachedMethods = /* @__PURE__ */ new Map();
  function getMethod(target, prop) {
    if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === "string")) {
      return;
    }
    if (cachedMethods.get(prop))
      return cachedMethods.get(prop);
    const targetFuncName = prop.replace(/FromIndex$/, "");
    const useIndex = prop !== targetFuncName;
    const isWrite = writeMethods.includes(targetFuncName);
    if (
      // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
      !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))
    ) {
      return;
    }
    const method = async function(storeName, ...args) {
      const tx = this.transaction(storeName, isWrite ? "readwrite" : "readonly");
      let target2 = tx.store;
      if (useIndex)
        target2 = target2.index(args.shift());
      return (await Promise.all([
        target2[targetFuncName](...args),
        isWrite && tx.done
      ]))[0];
    };
    cachedMethods.set(prop, method);
    return method;
  }
  replaceTraps((oldTraps) => ({
    ...oldTraps,
    get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
    has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop)
  }));

  // node_modules/@firebase/app/dist/esm/index.esm2017.js
  var PlatformLoggerServiceImpl = class {
    constructor(container) {
      this.container = container;
    }
    // In initial implementation, this will be called by installations on
    // auth token refresh, and installations will send this string.
    getPlatformInfoString() {
      const providers = this.container.getProviders();
      return providers.map((provider) => {
        if (isVersionServiceProvider(provider)) {
          const service = provider.getImmediate();
          return `${service.library}/${service.version}`;
        } else {
          return null;
        }
      }).filter((logString) => logString).join(" ");
    }
  };
  function isVersionServiceProvider(provider) {
    const component = provider.getComponent();
    return (component === null || component === void 0 ? void 0 : component.type) === "VERSION";
  }
  var name$p = "@firebase/app";
  var version$1 = "0.10.4";
  var logger = new Logger("@firebase/app");
  var name$o = "@firebase/app-compat";
  var name$n = "@firebase/analytics-compat";
  var name$m = "@firebase/analytics";
  var name$l = "@firebase/app-check-compat";
  var name$k = "@firebase/app-check";
  var name$j = "@firebase/auth";
  var name$i = "@firebase/auth-compat";
  var name$h = "@firebase/database";
  var name$g = "@firebase/database-compat";
  var name$f = "@firebase/functions";
  var name$e = "@firebase/functions-compat";
  var name$d = "@firebase/installations";
  var name$c = "@firebase/installations-compat";
  var name$b = "@firebase/messaging";
  var name$a = "@firebase/messaging-compat";
  var name$9 = "@firebase/performance";
  var name$8 = "@firebase/performance-compat";
  var name$7 = "@firebase/remote-config";
  var name$6 = "@firebase/remote-config-compat";
  var name$5 = "@firebase/storage";
  var name$4 = "@firebase/storage-compat";
  var name$3 = "@firebase/firestore";
  var name$2 = "@firebase/vertexai-preview";
  var name$1 = "@firebase/firestore-compat";
  var name = "firebase";
  var version = "10.12.1";
  var DEFAULT_ENTRY_NAME2 = "[DEFAULT]";
  var PLATFORM_LOG_STRING = {
    [name$p]: "fire-core",
    [name$o]: "fire-core-compat",
    [name$m]: "fire-analytics",
    [name$n]: "fire-analytics-compat",
    [name$k]: "fire-app-check",
    [name$l]: "fire-app-check-compat",
    [name$j]: "fire-auth",
    [name$i]: "fire-auth-compat",
    [name$h]: "fire-rtdb",
    [name$g]: "fire-rtdb-compat",
    [name$f]: "fire-fn",
    [name$e]: "fire-fn-compat",
    [name$d]: "fire-iid",
    [name$c]: "fire-iid-compat",
    [name$b]: "fire-fcm",
    [name$a]: "fire-fcm-compat",
    [name$9]: "fire-perf",
    [name$8]: "fire-perf-compat",
    [name$7]: "fire-rc",
    [name$6]: "fire-rc-compat",
    [name$5]: "fire-gcs",
    [name$4]: "fire-gcs-compat",
    [name$3]: "fire-fst",
    [name$1]: "fire-fst-compat",
    [name$2]: "fire-vertex",
    "fire-js": "fire-js",
    [name]: "fire-js-all"
  };
  var _apps = /* @__PURE__ */ new Map();
  var _serverApps = /* @__PURE__ */ new Map();
  var _components = /* @__PURE__ */ new Map();
  function _addComponent(app2, component) {
    try {
      app2.container.addComponent(component);
    } catch (e) {
      logger.debug(`Component ${component.name} failed to register with FirebaseApp ${app2.name}`, e);
    }
  }
  function _registerComponent(component) {
    const componentName = component.name;
    if (_components.has(componentName)) {
      logger.debug(`There were multiple attempts to register component ${componentName}.`);
      return false;
    }
    _components.set(componentName, component);
    for (const app2 of _apps.values()) {
      _addComponent(app2, component);
    }
    for (const serverApp of _serverApps.values()) {
      _addComponent(serverApp, component);
    }
    return true;
  }
  function _getProvider(app2, name3) {
    const heartbeatController = app2.container.getProvider("heartbeat").getImmediate({ optional: true });
    if (heartbeatController) {
      void heartbeatController.triggerHeartbeat();
    }
    return app2.container.getProvider(name3);
  }
  var ERRORS = {
    [
      "no-app"
      /* AppError.NO_APP */
    ]: "No Firebase App '{$appName}' has been created - call initializeApp() first",
    [
      "bad-app-name"
      /* AppError.BAD_APP_NAME */
    ]: "Illegal App name: '{$appName}'",
    [
      "duplicate-app"
      /* AppError.DUPLICATE_APP */
    ]: "Firebase App named '{$appName}' already exists with different options or config",
    [
      "app-deleted"
      /* AppError.APP_DELETED */
    ]: "Firebase App named '{$appName}' already deleted",
    [
      "server-app-deleted"
      /* AppError.SERVER_APP_DELETED */
    ]: "Firebase Server App has been deleted",
    [
      "no-options"
      /* AppError.NO_OPTIONS */
    ]: "Need to provide options, when not being deployed to hosting via source.",
    [
      "invalid-app-argument"
      /* AppError.INVALID_APP_ARGUMENT */
    ]: "firebase.{$appName}() takes either no argument or a Firebase App instance.",
    [
      "invalid-log-argument"
      /* AppError.INVALID_LOG_ARGUMENT */
    ]: "First argument to `onLog` must be null or a function.",
    [
      "idb-open"
      /* AppError.IDB_OPEN */
    ]: "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
    [
      "idb-get"
      /* AppError.IDB_GET */
    ]: "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
    [
      "idb-set"
      /* AppError.IDB_WRITE */
    ]: "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
    [
      "idb-delete"
      /* AppError.IDB_DELETE */
    ]: "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.",
    [
      "finalization-registry-not-supported"
      /* AppError.FINALIZATION_REGISTRY_NOT_SUPPORTED */
    ]: "FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.",
    [
      "invalid-server-app-environment"
      /* AppError.INVALID_SERVER_APP_ENVIRONMENT */
    ]: "FirebaseServerApp is not for use in browser environments."
  };
  var ERROR_FACTORY = new ErrorFactory("app", "Firebase", ERRORS);
  var FirebaseAppImpl = class {
    constructor(options, config, container) {
      this._isDeleted = false;
      this._options = Object.assign({}, options);
      this._config = Object.assign({}, config);
      this._name = config.name;
      this._automaticDataCollectionEnabled = config.automaticDataCollectionEnabled;
      this._container = container;
      this.container.addComponent(new Component(
        "app",
        () => this,
        "PUBLIC"
        /* ComponentType.PUBLIC */
      ));
    }
    get automaticDataCollectionEnabled() {
      this.checkDestroyed();
      return this._automaticDataCollectionEnabled;
    }
    set automaticDataCollectionEnabled(val) {
      this.checkDestroyed();
      this._automaticDataCollectionEnabled = val;
    }
    get name() {
      this.checkDestroyed();
      return this._name;
    }
    get options() {
      this.checkDestroyed();
      return this._options;
    }
    get config() {
      this.checkDestroyed();
      return this._config;
    }
    get container() {
      return this._container;
    }
    get isDeleted() {
      return this._isDeleted;
    }
    set isDeleted(val) {
      this._isDeleted = val;
    }
    /**
     * This function will throw an Error if the App has already been deleted -
     * use before performing API actions on the App.
     */
    checkDestroyed() {
      if (this.isDeleted) {
        throw ERROR_FACTORY.create("app-deleted", { appName: this._name });
      }
    }
  };
  var SDK_VERSION = version;
  function initializeApp(_options, rawConfig = {}) {
    let options = _options;
    if (typeof rawConfig !== "object") {
      const name4 = rawConfig;
      rawConfig = { name: name4 };
    }
    const config = Object.assign({ name: DEFAULT_ENTRY_NAME2, automaticDataCollectionEnabled: false }, rawConfig);
    const name3 = config.name;
    if (typeof name3 !== "string" || !name3) {
      throw ERROR_FACTORY.create("bad-app-name", {
        appName: String(name3)
      });
    }
    options || (options = getDefaultAppConfig());
    if (!options) {
      throw ERROR_FACTORY.create(
        "no-options"
        /* AppError.NO_OPTIONS */
      );
    }
    const existingApp = _apps.get(name3);
    if (existingApp) {
      if (deepEqual(options, existingApp.options) && deepEqual(config, existingApp.config)) {
        return existingApp;
      } else {
        throw ERROR_FACTORY.create("duplicate-app", { appName: name3 });
      }
    }
    const container = new ComponentContainer(name3);
    for (const component of _components.values()) {
      container.addComponent(component);
    }
    const newApp = new FirebaseAppImpl(options, config, container);
    _apps.set(name3, newApp);
    return newApp;
  }
  function getApp(name3 = DEFAULT_ENTRY_NAME2) {
    const app2 = _apps.get(name3);
    if (!app2 && name3 === DEFAULT_ENTRY_NAME2 && getDefaultAppConfig()) {
      return initializeApp();
    }
    if (!app2) {
      throw ERROR_FACTORY.create("no-app", { appName: name3 });
    }
    return app2;
  }
  function registerVersion(libraryKeyOrName, version3, variant) {
    var _a;
    let library = (_a = PLATFORM_LOG_STRING[libraryKeyOrName]) !== null && _a !== void 0 ? _a : libraryKeyOrName;
    if (variant) {
      library += `-${variant}`;
    }
    const libraryMismatch = library.match(/\s|\//);
    const versionMismatch = version3.match(/\s|\//);
    if (libraryMismatch || versionMismatch) {
      const warning = [
        `Unable to register library "${library}" with version "${version3}":`
      ];
      if (libraryMismatch) {
        warning.push(`library name "${library}" contains illegal characters (whitespace or "/")`);
      }
      if (libraryMismatch && versionMismatch) {
        warning.push("and");
      }
      if (versionMismatch) {
        warning.push(`version name "${version3}" contains illegal characters (whitespace or "/")`);
      }
      logger.warn(warning.join(" "));
      return;
    }
    _registerComponent(new Component(
      `${library}-version`,
      () => ({ library, version: version3 }),
      "VERSION"
      /* ComponentType.VERSION */
    ));
  }
  var DB_NAME = "firebase-heartbeat-database";
  var DB_VERSION = 1;
  var STORE_NAME = "firebase-heartbeat-store";
  var dbPromise = null;
  function getDbPromise() {
    if (!dbPromise) {
      dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade: (db, oldVersion) => {
          switch (oldVersion) {
            case 0:
              try {
                db.createObjectStore(STORE_NAME);
              } catch (e) {
                console.warn(e);
              }
          }
        }
      }).catch((e) => {
        throw ERROR_FACTORY.create("idb-open", {
          originalErrorMessage: e.message
        });
      });
    }
    return dbPromise;
  }
  async function readHeartbeatsFromIndexedDB(app2) {
    try {
      const db = await getDbPromise();
      const tx = db.transaction(STORE_NAME);
      const result = await tx.objectStore(STORE_NAME).get(computeKey(app2));
      await tx.done;
      return result;
    } catch (e) {
      if (e instanceof FirebaseError) {
        logger.warn(e.message);
      } else {
        const idbGetError = ERROR_FACTORY.create("idb-get", {
          originalErrorMessage: e === null || e === void 0 ? void 0 : e.message
        });
        logger.warn(idbGetError.message);
      }
    }
  }
  async function writeHeartbeatsToIndexedDB(app2, heartbeatObject) {
    try {
      const db = await getDbPromise();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const objectStore = tx.objectStore(STORE_NAME);
      await objectStore.put(heartbeatObject, computeKey(app2));
      await tx.done;
    } catch (e) {
      if (e instanceof FirebaseError) {
        logger.warn(e.message);
      } else {
        const idbGetError = ERROR_FACTORY.create("idb-set", {
          originalErrorMessage: e === null || e === void 0 ? void 0 : e.message
        });
        logger.warn(idbGetError.message);
      }
    }
  }
  function computeKey(app2) {
    return `${app2.name}!${app2.options.appId}`;
  }
  var MAX_HEADER_BYTES = 1024;
  var STORED_HEARTBEAT_RETENTION_MAX_MILLIS = 30 * 24 * 60 * 60 * 1e3;
  var HeartbeatServiceImpl = class {
    constructor(container) {
      this.container = container;
      this._heartbeatsCache = null;
      const app2 = this.container.getProvider("app").getImmediate();
      this._storage = new HeartbeatStorageImpl(app2);
      this._heartbeatsCachePromise = this._storage.read().then((result) => {
        this._heartbeatsCache = result;
        return result;
      });
    }
    /**
     * Called to report a heartbeat. The function will generate
     * a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
     * to IndexedDB.
     * Note that we only store one heartbeat per day. So if a heartbeat for today is
     * already logged, subsequent calls to this function in the same day will be ignored.
     */
    async triggerHeartbeat() {
      var _a, _b;
      const platformLogger = this.container.getProvider("platform-logger").getImmediate();
      const agent = platformLogger.getPlatformInfoString();
      const date = getUTCDateString();
      if (((_a = this._heartbeatsCache) === null || _a === void 0 ? void 0 : _a.heartbeats) == null) {
        this._heartbeatsCache = await this._heartbeatsCachePromise;
        if (((_b = this._heartbeatsCache) === null || _b === void 0 ? void 0 : _b.heartbeats) == null) {
          return;
        }
      }
      if (this._heartbeatsCache.lastSentHeartbeatDate === date || this._heartbeatsCache.heartbeats.some((singleDateHeartbeat) => singleDateHeartbeat.date === date)) {
        return;
      } else {
        this._heartbeatsCache.heartbeats.push({ date, agent });
      }
      this._heartbeatsCache.heartbeats = this._heartbeatsCache.heartbeats.filter((singleDateHeartbeat) => {
        const hbTimestamp = new Date(singleDateHeartbeat.date).valueOf();
        const now = Date.now();
        return now - hbTimestamp <= STORED_HEARTBEAT_RETENTION_MAX_MILLIS;
      });
      return this._storage.overwrite(this._heartbeatsCache);
    }
    /**
     * Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
     * It also clears all heartbeats from memory as well as in IndexedDB.
     *
     * NOTE: Consuming product SDKs should not send the header if this method
     * returns an empty string.
     */
    async getHeartbeatsHeader() {
      var _a;
      if (this._heartbeatsCache === null) {
        await this._heartbeatsCachePromise;
      }
      if (((_a = this._heartbeatsCache) === null || _a === void 0 ? void 0 : _a.heartbeats) == null || this._heartbeatsCache.heartbeats.length === 0) {
        return "";
      }
      const date = getUTCDateString();
      const { heartbeatsToSend, unsentEntries } = extractHeartbeatsForHeader(this._heartbeatsCache.heartbeats);
      const headerString = base64urlEncodeWithoutPadding(JSON.stringify({ version: 2, heartbeats: heartbeatsToSend }));
      this._heartbeatsCache.lastSentHeartbeatDate = date;
      if (unsentEntries.length > 0) {
        this._heartbeatsCache.heartbeats = unsentEntries;
        await this._storage.overwrite(this._heartbeatsCache);
      } else {
        this._heartbeatsCache.heartbeats = [];
        void this._storage.overwrite(this._heartbeatsCache);
      }
      return headerString;
    }
  };
  function getUTCDateString() {
    const today = /* @__PURE__ */ new Date();
    return today.toISOString().substring(0, 10);
  }
  function extractHeartbeatsForHeader(heartbeatsCache, maxSize = MAX_HEADER_BYTES) {
    const heartbeatsToSend = [];
    let unsentEntries = heartbeatsCache.slice();
    for (const singleDateHeartbeat of heartbeatsCache) {
      const heartbeatEntry = heartbeatsToSend.find((hb) => hb.agent === singleDateHeartbeat.agent);
      if (!heartbeatEntry) {
        heartbeatsToSend.push({
          agent: singleDateHeartbeat.agent,
          dates: [singleDateHeartbeat.date]
        });
        if (countBytes(heartbeatsToSend) > maxSize) {
          heartbeatsToSend.pop();
          break;
        }
      } else {
        heartbeatEntry.dates.push(singleDateHeartbeat.date);
        if (countBytes(heartbeatsToSend) > maxSize) {
          heartbeatEntry.dates.pop();
          break;
        }
      }
      unsentEntries = unsentEntries.slice(1);
    }
    return {
      heartbeatsToSend,
      unsentEntries
    };
  }
  var HeartbeatStorageImpl = class {
    constructor(app2) {
      this.app = app2;
      this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
    }
    async runIndexedDBEnvironmentCheck() {
      if (!isIndexedDBAvailable()) {
        return false;
      } else {
        return validateIndexedDBOpenable().then(() => true).catch(() => false);
      }
    }
    /**
     * Read all heartbeats.
     */
    async read() {
      const canUseIndexedDB = await this._canUseIndexedDBPromise;
      if (!canUseIndexedDB) {
        return { heartbeats: [] };
      } else {
        const idbHeartbeatObject = await readHeartbeatsFromIndexedDB(this.app);
        if (idbHeartbeatObject === null || idbHeartbeatObject === void 0 ? void 0 : idbHeartbeatObject.heartbeats) {
          return idbHeartbeatObject;
        } else {
          return { heartbeats: [] };
        }
      }
    }
    // overwrite the storage with the provided heartbeats
    async overwrite(heartbeatsObject) {
      var _a;
      const canUseIndexedDB = await this._canUseIndexedDBPromise;
      if (!canUseIndexedDB) {
        return;
      } else {
        const existingHeartbeatsObject = await this.read();
        return writeHeartbeatsToIndexedDB(this.app, {
          lastSentHeartbeatDate: (_a = heartbeatsObject.lastSentHeartbeatDate) !== null && _a !== void 0 ? _a : existingHeartbeatsObject.lastSentHeartbeatDate,
          heartbeats: heartbeatsObject.heartbeats
        });
      }
    }
    // add heartbeats
    async add(heartbeatsObject) {
      var _a;
      const canUseIndexedDB = await this._canUseIndexedDBPromise;
      if (!canUseIndexedDB) {
        return;
      } else {
        const existingHeartbeatsObject = await this.read();
        return writeHeartbeatsToIndexedDB(this.app, {
          lastSentHeartbeatDate: (_a = heartbeatsObject.lastSentHeartbeatDate) !== null && _a !== void 0 ? _a : existingHeartbeatsObject.lastSentHeartbeatDate,
          heartbeats: [
            ...existingHeartbeatsObject.heartbeats,
            ...heartbeatsObject.heartbeats
          ]
        });
      }
    }
  };
  function countBytes(heartbeatsCache) {
    return base64urlEncodeWithoutPadding(
      // heartbeatsCache wrapper properties
      JSON.stringify({ version: 2, heartbeats: heartbeatsCache })
    ).length;
  }
  function registerCoreComponents(variant) {
    _registerComponent(new Component(
      "platform-logger",
      (container) => new PlatformLoggerServiceImpl(container),
      "PRIVATE"
      /* ComponentType.PRIVATE */
    ));
    _registerComponent(new Component(
      "heartbeat",
      (container) => new HeartbeatServiceImpl(container),
      "PRIVATE"
      /* ComponentType.PRIVATE */
    ));
    registerVersion(name$p, version$1, variant);
    registerVersion(name$p, version$1, "esm2017");
    registerVersion("fire-js", "");
  }
  registerCoreComponents("");

  // node_modules/firebase/app/dist/esm/index.esm.js
  var name2 = "firebase";
  var version2 = "10.12.1";
  registerVersion(name2, version2, "app");

  // node_modules/@firebase/firestore/dist/lite/index.browser.esm2017.js
  var User = class {
    constructor(t) {
      this.uid = t;
    }
    isAuthenticated() {
      return null != this.uid;
    }
    /**
     * Returns a key representing this user, suitable for inclusion in a
     * dictionary.
     */
    toKey() {
      return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
    }
    isEqual(t) {
      return t.uid === this.uid;
    }
  };
  User.UNAUTHENTICATED = new User(null), // TODO(mikelehen): Look into getting a proper uid-equivalent for
  // non-FirebaseAuth providers.
  User.GOOGLE_CREDENTIALS = new User("google-credentials-uid"), User.FIRST_PARTY = new User("first-party-uid"), User.MOCK_USER = new User("mock-user");
  var d = "10.12.1";
  var f = new Logger("@firebase/firestore");
  function __PRIVATE_logDebug(t, ...e) {
    if (f.logLevel <= LogLevel.DEBUG) {
      const r = e.map(__PRIVATE_argToString);
      f.debug(`Firestore (${d}): ${t}`, ...r);
    }
  }
  function __PRIVATE_logError(t, ...e) {
    if (f.logLevel <= LogLevel.ERROR) {
      const r = e.map(__PRIVATE_argToString);
      f.error(`Firestore (${d}): ${t}`, ...r);
    }
  }
  function __PRIVATE_logWarn(t, ...e) {
    if (f.logLevel <= LogLevel.WARN) {
      const r = e.map(__PRIVATE_argToString);
      f.warn(`Firestore (${d}): ${t}`, ...r);
    }
  }
  function __PRIVATE_argToString(t) {
    if ("string" == typeof t) return t;
    try {
      return function __PRIVATE_formatJSON(t2) {
        return JSON.stringify(t2);
      }(t);
    } catch (e) {
      return t;
    }
  }
  function fail(t = "Unexpected state") {
    const e = `FIRESTORE (${d}) INTERNAL ASSERTION FAILED: ` + t;
    throw __PRIVATE_logError(e), new Error(e);
  }
  function __PRIVATE_hardAssert(t, e) {
    t || fail();
  }
  function __PRIVATE_debugCast(t, e) {
    return t;
  }
  var E = "ok";
  var m = "cancelled";
  var A = "unknown";
  var T = "invalid-argument";
  var R = "deadline-exceeded";
  var P = "not-found";
  var V = "permission-denied";
  var p = "unauthenticated";
  var y = "resource-exhausted";
  var w = "failed-precondition";
  var g = "aborted";
  var F = "out-of-range";
  var v = "unimplemented";
  var D = "internal";
  var b = "unavailable";
  var FirestoreError = class extends FirebaseError {
    /** @hideconstructor */
    constructor(t, e) {
      super(t, e), this.code = t, this.message = e, // HACK: We write a toString property directly because Error is not a real
      // class and so inheritance does not work correctly. We could alternatively
      // do the same "back-door inheritance" trick that FirebaseError does.
      this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`;
    }
  };
  var __PRIVATE_OAuthToken = class {
    constructor(t, e) {
      this.user = e, this.type = "OAuth", this.headers = /* @__PURE__ */ new Map(), this.headers.set("Authorization", `Bearer ${t}`);
    }
  };
  var __PRIVATE_EmptyAuthCredentialsProvider = class {
    getToken() {
      return Promise.resolve(null);
    }
    invalidateToken() {
    }
    start(t, e) {
      t.enqueueRetryable(() => e(User.UNAUTHENTICATED));
    }
    shutdown() {
    }
  };
  var __PRIVATE_EmulatorAuthCredentialsProvider = class {
    constructor(t) {
      this.token = t, /**
       * Stores the listener registered with setChangeListener()
       * This isn't actually necessary since the UID never changes, but we use this
       * to verify the listen contract is adhered to in tests.
       */
      this.changeListener = null;
    }
    getToken() {
      return Promise.resolve(this.token);
    }
    invalidateToken() {
    }
    start(t, e) {
      this.changeListener = e, // Fire with initial user.
      t.enqueueRetryable(() => e(this.token.user));
    }
    shutdown() {
      this.changeListener = null;
    }
  };
  var __PRIVATE_LiteAuthCredentialsProvider = class {
    constructor(t) {
      this.auth = null, t.onInit((t2) => {
        this.auth = t2;
      });
    }
    getToken() {
      return this.auth ? this.auth.getToken().then((t) => t ? (__PRIVATE_hardAssert("string" == typeof t.accessToken), new __PRIVATE_OAuthToken(t.accessToken, new User(this.auth.getUid()))) : null) : Promise.resolve(null);
    }
    invalidateToken() {
    }
    start(t, e) {
    }
    shutdown() {
    }
  };
  var __PRIVATE_FirstPartyToken = class {
    constructor(t, e, r) {
      this.t = t, this.i = e, this.o = r, this.type = "FirstParty", this.user = User.FIRST_PARTY, this.u = /* @__PURE__ */ new Map();
    }
    /**
     * Gets an authorization token, using a provided factory function, or return
     * null.
     */
    l() {
      return this.o ? this.o() : null;
    }
    get headers() {
      this.u.set("X-Goog-AuthUser", this.t);
      const t = this.l();
      return t && this.u.set("Authorization", t), this.i && this.u.set("X-Goog-Iam-Authorization-Token", this.i), this.u;
    }
  };
  var __PRIVATE_FirstPartyAuthCredentialsProvider = class {
    constructor(t, e, r) {
      this.t = t, this.i = e, this.o = r;
    }
    getToken() {
      return Promise.resolve(new __PRIVATE_FirstPartyToken(this.t, this.i, this.o));
    }
    start(t, e) {
      t.enqueueRetryable(() => e(User.FIRST_PARTY));
    }
    shutdown() {
    }
    invalidateToken() {
    }
  };
  var AppCheckToken = class {
    constructor(t) {
      this.value = t, this.type = "AppCheck", this.headers = /* @__PURE__ */ new Map(), t && t.length > 0 && this.headers.set("x-firebase-appcheck", this.value);
    }
  };
  var __PRIVATE_LiteAppCheckTokenProvider = class {
    constructor(t) {
      this.h = t, this.appCheck = null, t.onInit((t2) => {
        this.appCheck = t2;
      });
    }
    getToken() {
      return this.appCheck ? this.appCheck.getToken().then((t) => t ? (__PRIVATE_hardAssert("string" == typeof t.token), new AppCheckToken(t.token)) : null) : Promise.resolve(null);
    }
    invalidateToken() {
    }
    start(t, e) {
    }
    shutdown() {
    }
  };
  var DatabaseInfo = class {
    /**
     * Constructs a DatabaseInfo using the provided host, databaseId and
     * persistenceKey.
     *
     * @param databaseId - The database to use.
     * @param appId - The Firebase App Id.
     * @param persistenceKey - A unique identifier for this Firestore's local
     * storage (used in conjunction with the databaseId).
     * @param host - The Firestore backend host to connect to.
     * @param ssl - Whether to use SSL when connecting.
     * @param forceLongPolling - Whether to use the forceLongPolling option
     * when using WebChannel as the network transport.
     * @param autoDetectLongPolling - Whether to use the detectBufferingProxy
     * option when using WebChannel as the network transport.
     * @param longPollingOptions Options that configure long-polling.
     * @param useFetchStreams Whether to use the Fetch API instead of
     * XMLHTTPRequest
     */
    constructor(t, e, r, n, i, s, o, a, u) {
      this.databaseId = t, this.appId = e, this.persistenceKey = r, this.host = n, this.ssl = i, this.forceLongPolling = s, this.autoDetectLongPolling = o, this.longPollingOptions = a, this.useFetchStreams = u;
    }
  };
  var DatabaseId = class _DatabaseId {
    constructor(t, e) {
      this.projectId = t, this.database = e || "(default)";
    }
    static empty() {
      return new _DatabaseId("", "");
    }
    get isDefaultDatabase() {
      return "(default)" === this.database;
    }
    isEqual(t) {
      return t instanceof _DatabaseId && t.projectId === this.projectId && t.database === this.database;
    }
  };
  var BasePath = class _BasePath {
    constructor(t, e, r) {
      void 0 === e ? e = 0 : e > t.length && fail(), void 0 === r ? r = t.length - e : r > t.length - e && fail(), this.segments = t, this.offset = e, this.len = r;
    }
    get length() {
      return this.len;
    }
    isEqual(t) {
      return 0 === _BasePath.comparator(this, t);
    }
    child(t) {
      const e = this.segments.slice(this.offset, this.limit());
      return t instanceof _BasePath ? t.forEach((t2) => {
        e.push(t2);
      }) : e.push(t), this.construct(e);
    }
    /** The index of one past the last segment of the path. */
    limit() {
      return this.offset + this.length;
    }
    popFirst(t) {
      return t = void 0 === t ? 1 : t, this.construct(this.segments, this.offset + t, this.length - t);
    }
    popLast() {
      return this.construct(this.segments, this.offset, this.length - 1);
    }
    firstSegment() {
      return this.segments[this.offset];
    }
    lastSegment() {
      return this.get(this.length - 1);
    }
    get(t) {
      return this.segments[this.offset + t];
    }
    isEmpty() {
      return 0 === this.length;
    }
    isPrefixOf(t) {
      if (t.length < this.length) return false;
      for (let e = 0; e < this.length; e++) if (this.get(e) !== t.get(e)) return false;
      return true;
    }
    isImmediateParentOf(t) {
      if (this.length + 1 !== t.length) return false;
      for (let e = 0; e < this.length; e++) if (this.get(e) !== t.get(e)) return false;
      return true;
    }
    forEach(t) {
      for (let e = this.offset, r = this.limit(); e < r; e++) t(this.segments[e]);
    }
    toArray() {
      return this.segments.slice(this.offset, this.limit());
    }
    static comparator(t, e) {
      const r = Math.min(t.length, e.length);
      for (let n = 0; n < r; n++) {
        const r2 = t.get(n), i = e.get(n);
        if (r2 < i) return -1;
        if (r2 > i) return 1;
      }
      return t.length < e.length ? -1 : t.length > e.length ? 1 : 0;
    }
  };
  var ResourcePath = class _ResourcePath extends BasePath {
    construct(t, e, r) {
      return new _ResourcePath(t, e, r);
    }
    canonicalString() {
      return this.toArray().join("/");
    }
    toString() {
      return this.canonicalString();
    }
    /**
     * Returns a string representation of this path
     * where each path segment has been encoded with
     * `encodeURIComponent`.
     */
    toUriEncodedString() {
      return this.toArray().map(encodeURIComponent).join("/");
    }
    /**
     * Creates a resource path from the given slash-delimited string. If multiple
     * arguments are provided, all components are combined. Leading and trailing
     * slashes from all components are ignored.
     */
    static fromString(...t) {
      const e = [];
      for (const r of t) {
        if (r.indexOf("//") >= 0) throw new FirestoreError(T, `Invalid segment (${r}). Paths must not contain // in them.`);
        e.push(...r.split("/").filter((t2) => t2.length > 0));
      }
      return new _ResourcePath(e);
    }
    static emptyPath() {
      return new _ResourcePath([]);
    }
  };
  var S = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
  var FieldPath$1 = class _FieldPath$1 extends BasePath {
    construct(t, e, r) {
      return new _FieldPath$1(t, e, r);
    }
    /**
     * Returns true if the string could be used as a segment in a field path
     * without escaping.
     */
    static isValidIdentifier(t) {
      return S.test(t);
    }
    canonicalString() {
      return this.toArray().map((t) => (t = t.replace(/\\/g, "\\\\").replace(/`/g, "\\`"), _FieldPath$1.isValidIdentifier(t) || (t = "`" + t + "`"), t)).join(".");
    }
    toString() {
      return this.canonicalString();
    }
    /**
     * Returns true if this field references the key of a document.
     */
    isKeyField() {
      return 1 === this.length && "__name__" === this.get(0);
    }
    /**
     * The field designating the key of a document.
     */
    static keyField() {
      return new _FieldPath$1(["__name__"]);
    }
    /**
     * Parses a field string from the given server-formatted string.
     *
     * - Splitting the empty string is not allowed (for now at least).
     * - Empty segments within the string (e.g. if there are two consecutive
     *   separators) are not allowed.
     *
     * TODO(b/37244157): we should make this more strict. Right now, it allows
     * non-identifier path components, even if they aren't escaped.
     */
    static fromServerFormat(t) {
      const e = [];
      let r = "", n = 0;
      const __PRIVATE_addCurrentSegment = () => {
        if (0 === r.length) throw new FirestoreError(T, `Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
        e.push(r), r = "";
      };
      let i = false;
      for (; n < t.length; ) {
        const e2 = t[n];
        if ("\\" === e2) {
          if (n + 1 === t.length) throw new FirestoreError(T, "Path has trailing escape character: " + t);
          const e3 = t[n + 1];
          if ("\\" !== e3 && "." !== e3 && "`" !== e3) throw new FirestoreError(T, "Path has invalid escape sequence: " + t);
          r += e3, n += 2;
        } else "`" === e2 ? (i = !i, n++) : "." !== e2 || i ? (r += e2, n++) : (__PRIVATE_addCurrentSegment(), n++);
      }
      if (__PRIVATE_addCurrentSegment(), i) throw new FirestoreError(T, "Unterminated ` in path: " + t);
      return new _FieldPath$1(e);
    }
    static emptyPath() {
      return new _FieldPath$1([]);
    }
  };
  var DocumentKey = class _DocumentKey {
    constructor(t) {
      this.path = t;
    }
    static fromPath(t) {
      return new _DocumentKey(ResourcePath.fromString(t));
    }
    static fromName(t) {
      return new _DocumentKey(ResourcePath.fromString(t).popFirst(5));
    }
    static empty() {
      return new _DocumentKey(ResourcePath.emptyPath());
    }
    get collectionGroup() {
      return this.path.popLast().lastSegment();
    }
    /** Returns true if the document is in the specified collectionId. */
    hasCollectionId(t) {
      return this.path.length >= 2 && this.path.get(this.path.length - 2) === t;
    }
    /** Returns the collection group (i.e. the name of the parent collection) for this key. */
    getCollectionGroup() {
      return this.path.get(this.path.length - 2);
    }
    /** Returns the fully qualified path to the parent collection. */
    getCollectionPath() {
      return this.path.popLast();
    }
    isEqual(t) {
      return null !== t && 0 === ResourcePath.comparator(this.path, t.path);
    }
    toString() {
      return this.path.toString();
    }
    static comparator(t, e) {
      return ResourcePath.comparator(t.path, e.path);
    }
    static isDocumentKey(t) {
      return t.length % 2 == 0;
    }
    /**
     * Creates and returns a new document key with the given segments.
     *
     * @param segments - The segments of the path to the document
     * @returns A new instance of DocumentKey
     */
    static fromSegments(t) {
      return new _DocumentKey(new ResourcePath(t.slice()));
    }
  };
  function __PRIVATE_validateNonEmptyArgument(t, e, r) {
    if (!r) throw new FirestoreError(T, `Function ${t}() cannot be called with an empty ${e}.`);
  }
  function __PRIVATE_validateDocumentPath(t) {
    if (!DocumentKey.isDocumentKey(t)) throw new FirestoreError(T, `Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`);
  }
  function __PRIVATE_valueDescription(t) {
    if (void 0 === t) return "undefined";
    if (null === t) return "null";
    if ("string" == typeof t) return t.length > 20 && (t = `${t.substring(0, 20)}...`), JSON.stringify(t);
    if ("number" == typeof t || "boolean" == typeof t) return "" + t;
    if ("object" == typeof t) {
      if (t instanceof Array) return "an array";
      {
        const e = (
          /** try to get the constructor name for an object. */
          function __PRIVATE_tryGetCustomObjectType(t2) {
            if (t2.constructor) return t2.constructor.name;
            return null;
          }(t)
        );
        return e ? `a custom ${e} object` : "an object";
      }
    }
    return "function" == typeof t ? "a function" : fail();
  }
  function __PRIVATE_cast(t, e) {
    if ("_delegate" in t && // Unwrap Compat types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (t = t._delegate), !(t instanceof e)) {
      if (e.name === t.constructor.name) throw new FirestoreError(T, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
      {
        const r = __PRIVATE_valueDescription(t);
        throw new FirestoreError(T, `Expected type '${e.name}', but it was: ${r}`);
      }
    }
    return t;
  }
  function __PRIVATE_cloneLongPollingOptions(t) {
    const e = {};
    return void 0 !== t.timeoutSeconds && (e.timeoutSeconds = t.timeoutSeconds), e;
  }
  var N = null;
  function __PRIVATE_generateUniqueDebugId() {
    return null === N ? N = function __PRIVATE_generateInitialUniqueDebugId() {
      return 268435456 + Math.round(2147483648 * Math.random());
    }() : N++, "0x" + N.toString(16);
  }
  function __PRIVATE_isNegativeZero(t) {
    return 0 === t && 1 / t == -1 / 0;
  }
  var O = {
    BatchGetDocuments: "batchGet",
    Commit: "commit",
    RunQuery: "runQuery",
    RunAggregationQuery: "runAggregationQuery"
  };
  var q;
  var B;
  function __PRIVATE_mapCodeFromHttpStatus(t) {
    if (void 0 === t) return __PRIVATE_logError("RPC_ERROR", "HTTP error has no status"), A;
    switch (t) {
      case 200:
        return E;
      case 400:
        return w;
      case 401:
        return p;
      case 403:
        return V;
      case 404:
        return P;
      case 409:
        return g;
      case 416:
        return F;
      case 429:
        return y;
      case 499:
        return m;
      case 500:
        return A;
      case 501:
        return v;
      case 503:
        return b;
      case 504:
        return R;
      default:
        return t >= 200 && t < 300 ? E : t >= 400 && t < 500 ? w : t >= 500 && t < 600 ? D : A;
    }
  }
  (B = q || (q = {}))[B.OK = 0] = "OK", B[B.CANCELLED = 1] = "CANCELLED", B[B.UNKNOWN = 2] = "UNKNOWN", B[B.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", B[B.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", B[B.NOT_FOUND = 5] = "NOT_FOUND", B[B.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", B[B.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", B[B.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", B[B.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", B[B.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", B[B.ABORTED = 10] = "ABORTED", B[B.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", B[B.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", B[B.INTERNAL = 13] = "INTERNAL", B[B.UNAVAILABLE = 14] = "UNAVAILABLE", B[B.DATA_LOSS = 15] = "DATA_LOSS";
  var __PRIVATE_FetchConnection = class extends /**
   * Base class for all Rest-based connections to the backend (WebChannel and
   * HTTP).
   */
  class __PRIVATE_RestConnection {
    constructor(t) {
      this.databaseInfo = t, this.databaseId = t.databaseId;
      const e = t.ssl ? "https" : "http", r = encodeURIComponent(this.databaseId.projectId), n = encodeURIComponent(this.databaseId.database);
      this.m = e + "://" + t.host, this.A = `projects/${r}/databases/${n}`, this.T = "(default)" === this.databaseId.database ? `project_id=${r}` : `project_id=${r}&database_id=${n}`;
    }
    get R() {
      return false;
    }
    P(t, e, r, n, i) {
      const s = __PRIVATE_generateUniqueDebugId(), o = this.I(t, e.toUriEncodedString());
      __PRIVATE_logDebug("RestConnection", `Sending RPC '${t}' ${s}:`, o, r);
      const a = {
        "google-cloud-resource-prefix": this.A,
        "x-goog-request-params": this.T
      };
      return this.V(a, n, i), this.p(t, o, a, r).then((e2) => (__PRIVATE_logDebug("RestConnection", `Received RPC '${t}' ${s}: `, e2), e2), (e2) => {
        throw __PRIVATE_logWarn("RestConnection", `RPC '${t}' ${s} failed with error: `, e2, "url: ", o, "request:", r), e2;
      });
    }
    g(t, e, r, n, i, s) {
      return this.P(t, e, r, n, i);
    }
    /**
     * Modifies the headers for a request, adding any authorization token if
     * present and any additional headers for the request.
     */
    V(t, e, r) {
      t["X-Goog-Api-Client"] = // SDK_VERSION is updated to different value at runtime depending on the entry point,
      // so we need to get its value when we need it in a function.
      function __PRIVATE_getGoogApiClientValue() {
        return "gl-js/ fire/" + d;
      }(), // Content-Type: text/plain will avoid preflight requests which might
      // mess with CORS and redirects by proxies. If we add custom headers
      // we will need to change this code to potentially use the $httpOverwrite
      // parameter supported by ESF to avoid triggering preflight requests.
      t["Content-Type"] = "text/plain", this.databaseInfo.appId && (t["X-Firebase-GMPID"] = this.databaseInfo.appId), e && e.headers.forEach((e2, r2) => t[r2] = e2), r && r.headers.forEach((e2, r2) => t[r2] = e2);
    }
    I(t, e) {
      const r = O[t];
      return `${this.m}/v1/${e}:${r}`;
    }
    /**
     * Closes and cleans up any resources associated with the connection. This
     * implementation is a no-op because there are no resources associated
     * with the RestConnection that need to be cleaned up.
     */
    terminate() {
    }
  } {
    /**
     * @param databaseInfo - The connection info.
     * @param fetchImpl - `fetch` or a Polyfill that implements the fetch API.
     */
    constructor(t, e) {
      super(t), this.F = e;
    }
    v(t, e) {
      throw new Error("Not supported by FetchConnection");
    }
    async p(t, e, r, n) {
      var i;
      const s = JSON.stringify(n);
      let o;
      try {
        o = await this.F(e, {
          method: "POST",
          headers: r,
          body: s
        });
      } catch (t2) {
        const e2 = t2;
        throw new FirestoreError(__PRIVATE_mapCodeFromHttpStatus(e2.status), "Request failed with error: " + e2.statusText);
      }
      if (!o.ok) {
        let t2 = await o.json();
        Array.isArray(t2) && (t2 = t2[0]);
        const e2 = null === (i = null == t2 ? void 0 : t2.error) || void 0 === i ? void 0 : i.message;
        throw new FirestoreError(__PRIVATE_mapCodeFromHttpStatus(o.status), `Request failed with error: ${null != e2 ? e2 : o.statusText}`);
      }
      return o.json();
    }
  };
  function __PRIVATE_randomBytes(t) {
    const e = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "undefined" != typeof self && (self.crypto || self.msCrypto)
    ), r = new Uint8Array(t);
    if (e && "function" == typeof e.getRandomValues) e.getRandomValues(r);
    else
      for (let e2 = 0; e2 < t; e2++) r[e2] = Math.floor(256 * Math.random());
    return r;
  }
  var __PRIVATE_AutoId = class {
    static newId() {
      const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", e = Math.floor(256 / t.length) * t.length;
      let r = "";
      for (; r.length < 20; ) {
        const n = __PRIVATE_randomBytes(40);
        for (let i = 0; i < n.length; ++i)
          r.length < 20 && n[i] < e && (r += t.charAt(n[i] % t.length));
      }
      return r;
    }
  };
  function __PRIVATE_primitiveComparator(t, e) {
    return t < e ? -1 : t > e ? 1 : 0;
  }
  function __PRIVATE_arrayEquals(t, e, r) {
    return t.length === e.length && t.every((t2, n) => r(t2, e[n]));
  }
  function __PRIVATE_objectSize(t) {
    let e = 0;
    for (const r in t) Object.prototype.hasOwnProperty.call(t, r) && e++;
    return e;
  }
  function forEach(t, e) {
    for (const r in t) Object.prototype.hasOwnProperty.call(t, r) && e(r, t[r]);
  }
  var __PRIVATE_Base64DecodeError = class extends Error {
    constructor() {
      super(...arguments), this.name = "Base64DecodeError";
    }
  };
  var ByteString = class _ByteString {
    constructor(t) {
      this.binaryString = t;
    }
    static fromBase64String(t) {
      const e = function __PRIVATE_decodeBase64(t2) {
        try {
          return atob(t2);
        } catch (t3) {
          throw "undefined" != typeof DOMException && t3 instanceof DOMException ? new __PRIVATE_Base64DecodeError("Invalid base64 string: " + t3) : t3;
        }
      }(t);
      return new _ByteString(e);
    }
    static fromUint8Array(t) {
      const e = (
        /**
        * Helper function to convert an Uint8array to a binary string.
        */
        function __PRIVATE_binaryStringFromUint8Array(t2) {
          let e2 = "";
          for (let r = 0; r < t2.length; ++r) e2 += String.fromCharCode(t2[r]);
          return e2;
        }(t)
      );
      return new _ByteString(e);
    }
    [Symbol.iterator]() {
      let t = 0;
      return {
        next: () => t < this.binaryString.length ? {
          value: this.binaryString.charCodeAt(t++),
          done: false
        } : {
          value: void 0,
          done: true
        }
      };
    }
    toBase64() {
      return function __PRIVATE_encodeBase64(t) {
        return btoa(t);
      }(this.binaryString);
    }
    toUint8Array() {
      return function __PRIVATE_uint8ArrayFromBinaryString(t) {
        const e = new Uint8Array(t.length);
        for (let r = 0; r < t.length; r++) e[r] = t.charCodeAt(r);
        return e;
      }(this.binaryString);
    }
    approximateByteSize() {
      return 2 * this.binaryString.length;
    }
    compareTo(t) {
      return __PRIVATE_primitiveComparator(this.binaryString, t.binaryString);
    }
    isEqual(t) {
      return this.binaryString === t.binaryString;
    }
  };
  ByteString.EMPTY_BYTE_STRING = new ByteString("");
  var $ = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);
  function __PRIVATE_normalizeTimestamp(t) {
    if (__PRIVATE_hardAssert(!!t), "string" == typeof t) {
      let e = 0;
      const r = $.exec(t);
      if (__PRIVATE_hardAssert(!!r), r[1]) {
        let t2 = r[1];
        t2 = (t2 + "000000000").substr(0, 9), e = Number(t2);
      }
      const n = new Date(t);
      return {
        seconds: Math.floor(n.getTime() / 1e3),
        nanos: e
      };
    }
    return {
      seconds: __PRIVATE_normalizeNumber(t.seconds),
      nanos: __PRIVATE_normalizeNumber(t.nanos)
    };
  }
  function __PRIVATE_normalizeNumber(t) {
    return "number" == typeof t ? t : "string" == typeof t ? Number(t) : 0;
  }
  function __PRIVATE_normalizeByteString(t) {
    return "string" == typeof t ? ByteString.fromBase64String(t) : ByteString.fromUint8Array(t);
  }
  var Timestamp = class _Timestamp {
    /**
     * Creates a new timestamp.
     *
     * @param seconds - The number of seconds of UTC time since Unix epoch
     *     1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
     *     9999-12-31T23:59:59Z inclusive.
     * @param nanoseconds - The non-negative fractions of a second at nanosecond
     *     resolution. Negative second values with fractions must still have
     *     non-negative nanoseconds values that count forward in time. Must be
     *     from 0 to 999,999,999 inclusive.
     */
    constructor(t, e) {
      if (this.seconds = t, this.nanoseconds = e, e < 0) throw new FirestoreError(T, "Timestamp nanoseconds out of range: " + e);
      if (e >= 1e9) throw new FirestoreError(T, "Timestamp nanoseconds out of range: " + e);
      if (t < -62135596800) throw new FirestoreError(T, "Timestamp seconds out of range: " + t);
      if (t >= 253402300800) throw new FirestoreError(T, "Timestamp seconds out of range: " + t);
    }
    /**
     * Creates a new timestamp with the current date, with millisecond precision.
     *
     * @returns a new timestamp representing the current date.
     */
    static now() {
      return _Timestamp.fromMillis(Date.now());
    }
    /**
     * Creates a new timestamp from the given date.
     *
     * @param date - The date to initialize the `Timestamp` from.
     * @returns A new `Timestamp` representing the same point in time as the given
     *     date.
     */
    static fromDate(t) {
      return _Timestamp.fromMillis(t.getTime());
    }
    /**
     * Creates a new timestamp from the given number of milliseconds.
     *
     * @param milliseconds - Number of milliseconds since Unix epoch
     *     1970-01-01T00:00:00Z.
     * @returns A new `Timestamp` representing the same point in time as the given
     *     number of milliseconds.
     */
    static fromMillis(t) {
      const e = Math.floor(t / 1e3), r = Math.floor(1e6 * (t - 1e3 * e));
      return new _Timestamp(e, r);
    }
    /**
     * Converts a `Timestamp` to a JavaScript `Date` object. This conversion
     * causes a loss of precision since `Date` objects only support millisecond
     * precision.
     *
     * @returns JavaScript `Date` object representing the same point in time as
     *     this `Timestamp`, with millisecond precision.
     */
    toDate() {
      return new Date(this.toMillis());
    }
    /**
     * Converts a `Timestamp` to a numeric timestamp (in milliseconds since
     * epoch). This operation causes a loss of precision.
     *
     * @returns The point in time corresponding to this timestamp, represented as
     *     the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
     */
    toMillis() {
      return 1e3 * this.seconds + this.nanoseconds / 1e6;
    }
    _compareTo(t) {
      return this.seconds === t.seconds ? __PRIVATE_primitiveComparator(this.nanoseconds, t.nanoseconds) : __PRIVATE_primitiveComparator(this.seconds, t.seconds);
    }
    /**
     * Returns true if this `Timestamp` is equal to the provided one.
     *
     * @param other - The `Timestamp` to compare against.
     * @returns true if this `Timestamp` is equal to the provided one.
     */
    isEqual(t) {
      return t.seconds === this.seconds && t.nanoseconds === this.nanoseconds;
    }
    /** Returns a textual representation of this `Timestamp`. */
    toString() {
      return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
    }
    /** Returns a JSON-serializable representation of this `Timestamp`. */
    toJSON() {
      return {
        seconds: this.seconds,
        nanoseconds: this.nanoseconds
      };
    }
    /**
     * Converts this object to a primitive string, which allows `Timestamp` objects
     * to be compared using the `>`, `<=`, `>=` and `>` operators.
     */
    valueOf() {
      const t = this.seconds - -62135596800;
      return String(t).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
    }
  };
  function __PRIVATE_isServerTimestamp(t) {
    var e, r;
    return "server_timestamp" === (null === (r = ((null === (e = null == t ? void 0 : t.mapValue) || void 0 === e ? void 0 : e.fields) || {}).__type__) || void 0 === r ? void 0 : r.stringValue);
  }
  function __PRIVATE_getPreviousValue(t) {
    const e = t.mapValue.fields.__previous_value__;
    return __PRIVATE_isServerTimestamp(e) ? __PRIVATE_getPreviousValue(e) : e;
  }
  function __PRIVATE_getLocalWriteTime(t) {
    const e = __PRIVATE_normalizeTimestamp(t.mapValue.fields.__local_write_time__.timestampValue);
    return new Timestamp(e.seconds, e.nanos);
  }
  function __PRIVATE_typeOrder(t) {
    return "nullValue" in t ? 0 : "booleanValue" in t ? 1 : "integerValue" in t || "doubleValue" in t ? 2 : "timestampValue" in t ? 3 : "stringValue" in t ? 5 : "bytesValue" in t ? 6 : "referenceValue" in t ? 7 : "geoPointValue" in t ? 8 : "arrayValue" in t ? 9 : "mapValue" in t ? __PRIVATE_isServerTimestamp(t) ? 4 : (
      /** Returns true if the Value represents the canonical {@link #MAX_VALUE} . */
      function __PRIVATE_isMaxValue(t2) {
        return "__max__" === (((t2.mapValue || {}).fields || {}).__type__ || {}).stringValue;
      }(t) ? 9007199254740991 : 10
    ) : fail();
  }
  function __PRIVATE_valueEquals(t, e) {
    if (t === e) return true;
    const r = __PRIVATE_typeOrder(t);
    if (r !== __PRIVATE_typeOrder(e)) return false;
    switch (r) {
      case 0:
      case 9007199254740991:
        return true;
      case 1:
        return t.booleanValue === e.booleanValue;
      case 4:
        return __PRIVATE_getLocalWriteTime(t).isEqual(__PRIVATE_getLocalWriteTime(e));
      case 3:
        return function __PRIVATE_timestampEquals(t2, e2) {
          if ("string" == typeof t2.timestampValue && "string" == typeof e2.timestampValue && t2.timestampValue.length === e2.timestampValue.length)
            return t2.timestampValue === e2.timestampValue;
          const r2 = __PRIVATE_normalizeTimestamp(t2.timestampValue), n = __PRIVATE_normalizeTimestamp(e2.timestampValue);
          return r2.seconds === n.seconds && r2.nanos === n.nanos;
        }(t, e);
      case 5:
        return t.stringValue === e.stringValue;
      case 6:
        return function __PRIVATE_blobEquals(t2, e2) {
          return __PRIVATE_normalizeByteString(t2.bytesValue).isEqual(__PRIVATE_normalizeByteString(e2.bytesValue));
        }(t, e);
      case 7:
        return t.referenceValue === e.referenceValue;
      case 8:
        return function __PRIVATE_geoPointEquals(t2, e2) {
          return __PRIVATE_normalizeNumber(t2.geoPointValue.latitude) === __PRIVATE_normalizeNumber(e2.geoPointValue.latitude) && __PRIVATE_normalizeNumber(t2.geoPointValue.longitude) === __PRIVATE_normalizeNumber(e2.geoPointValue.longitude);
        }(t, e);
      case 2:
        return function __PRIVATE_numberEquals(t2, e2) {
          if ("integerValue" in t2 && "integerValue" in e2) return __PRIVATE_normalizeNumber(t2.integerValue) === __PRIVATE_normalizeNumber(e2.integerValue);
          if ("doubleValue" in t2 && "doubleValue" in e2) {
            const r2 = __PRIVATE_normalizeNumber(t2.doubleValue), n = __PRIVATE_normalizeNumber(e2.doubleValue);
            return r2 === n ? __PRIVATE_isNegativeZero(r2) === __PRIVATE_isNegativeZero(n) : isNaN(r2) && isNaN(n);
          }
          return false;
        }(t, e);
      case 9:
        return __PRIVATE_arrayEquals(t.arrayValue.values || [], e.arrayValue.values || [], __PRIVATE_valueEquals);
      case 10:
        return function __PRIVATE_objectEquals(t2, e2) {
          const r2 = t2.mapValue.fields || {}, n = e2.mapValue.fields || {};
          if (__PRIVATE_objectSize(r2) !== __PRIVATE_objectSize(n)) return false;
          for (const t3 in r2) if (r2.hasOwnProperty(t3) && (void 0 === n[t3] || !__PRIVATE_valueEquals(r2[t3], n[t3]))) return false;
          return true;
        }(t, e);
      default:
        return fail();
    }
  }
  function __PRIVATE_isMapValue(t) {
    return !!t && "mapValue" in t;
  }
  function __PRIVATE_deepClone(t) {
    if (t.geoPointValue) return {
      geoPointValue: Object.assign({}, t.geoPointValue)
    };
    if (t.timestampValue && "object" == typeof t.timestampValue) return {
      timestampValue: Object.assign({}, t.timestampValue)
    };
    if (t.mapValue) {
      const e = {
        mapValue: {
          fields: {}
        }
      };
      return forEach(t.mapValue.fields, (t2, r) => e.mapValue.fields[t2] = __PRIVATE_deepClone(r)), e;
    }
    if (t.arrayValue) {
      const e = {
        arrayValue: {
          values: []
        }
      };
      for (let r = 0; r < (t.arrayValue.values || []).length; ++r) e.arrayValue.values[r] = __PRIVATE_deepClone(t.arrayValue.values[r]);
      return e;
    }
    return Object.assign({}, t);
  }
  var SnapshotVersion = class _SnapshotVersion {
    constructor(t) {
      this.timestamp = t;
    }
    static fromTimestamp(t) {
      return new _SnapshotVersion(t);
    }
    static min() {
      return new _SnapshotVersion(new Timestamp(0, 0));
    }
    static max() {
      return new _SnapshotVersion(new Timestamp(253402300799, 999999999));
    }
    compareTo(t) {
      return this.timestamp._compareTo(t.timestamp);
    }
    isEqual(t) {
      return this.timestamp.isEqual(t.timestamp);
    }
    /** Returns a number representation of the version for use in spec tests. */
    toMicroseconds() {
      return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
    }
    toString() {
      return "SnapshotVersion(" + this.timestamp.toString() + ")";
    }
    toTimestamp() {
      return this.timestamp;
    }
  };
  var LLRBNode = class _LLRBNode {
    constructor(t, e, r, n, i) {
      this.key = t, this.value = e, this.color = null != r ? r : _LLRBNode.RED, this.left = null != n ? n : _LLRBNode.EMPTY, this.right = null != i ? i : _LLRBNode.EMPTY, this.size = this.left.size + 1 + this.right.size;
    }
    // Returns a copy of the current node, optionally replacing pieces of it.
    copy(t, e, r, n, i) {
      return new _LLRBNode(null != t ? t : this.key, null != e ? e : this.value, null != r ? r : this.color, null != n ? n : this.left, null != i ? i : this.right);
    }
    isEmpty() {
      return false;
    }
    // Traverses the tree in key order and calls the specified action function
    // for each node. If action returns true, traversal is aborted.
    // Returns the first truthy value returned by action, or the last falsey
    // value returned by action.
    inorderTraversal(t) {
      return this.left.inorderTraversal(t) || t(this.key, this.value) || this.right.inorderTraversal(t);
    }
    // Traverses the tree in reverse key order and calls the specified action
    // function for each node. If action returns true, traversal is aborted.
    // Returns the first truthy value returned by action, or the last falsey
    // value returned by action.
    reverseTraversal(t) {
      return this.right.reverseTraversal(t) || t(this.key, this.value) || this.left.reverseTraversal(t);
    }
    // Returns the minimum node in the tree.
    min() {
      return this.left.isEmpty() ? this : this.left.min();
    }
    // Returns the maximum key in the tree.
    minKey() {
      return this.min().key;
    }
    // Returns the maximum key in the tree.
    maxKey() {
      return this.right.isEmpty() ? this.key : this.right.maxKey();
    }
    // Returns new tree, with the key/value added.
    insert(t, e, r) {
      let n = this;
      const i = r(t, n.key);
      return n = i < 0 ? n.copy(null, null, null, n.left.insert(t, e, r), null) : 0 === i ? n.copy(null, e, null, null, null) : n.copy(null, null, null, null, n.right.insert(t, e, r)), n.fixUp();
    }
    removeMin() {
      if (this.left.isEmpty()) return _LLRBNode.EMPTY;
      let t = this;
      return t.left.isRed() || t.left.left.isRed() || (t = t.moveRedLeft()), t = t.copy(null, null, null, t.left.removeMin(), null), t.fixUp();
    }
    // Returns new tree, with the specified item removed.
    remove(t, e) {
      let r, n = this;
      if (e(t, n.key) < 0) n.left.isEmpty() || n.left.isRed() || n.left.left.isRed() || (n = n.moveRedLeft()), n = n.copy(null, null, null, n.left.remove(t, e), null);
      else {
        if (n.left.isRed() && (n = n.rotateRight()), n.right.isEmpty() || n.right.isRed() || n.right.left.isRed() || (n = n.moveRedRight()), 0 === e(t, n.key)) {
          if (n.right.isEmpty()) return _LLRBNode.EMPTY;
          r = n.right.min(), n = n.copy(r.key, r.value, null, null, n.right.removeMin());
        }
        n = n.copy(null, null, null, null, n.right.remove(t, e));
      }
      return n.fixUp();
    }
    isRed() {
      return this.color;
    }
    // Returns new tree after performing any needed rotations.
    fixUp() {
      let t = this;
      return t.right.isRed() && !t.left.isRed() && (t = t.rotateLeft()), t.left.isRed() && t.left.left.isRed() && (t = t.rotateRight()), t.left.isRed() && t.right.isRed() && (t = t.colorFlip()), t;
    }
    moveRedLeft() {
      let t = this.colorFlip();
      return t.right.left.isRed() && (t = t.copy(null, null, null, null, t.right.rotateRight()), t = t.rotateLeft(), t = t.colorFlip()), t;
    }
    moveRedRight() {
      let t = this.colorFlip();
      return t.left.left.isRed() && (t = t.rotateRight(), t = t.colorFlip()), t;
    }
    rotateLeft() {
      const t = this.copy(null, null, _LLRBNode.RED, null, this.right.left);
      return this.right.copy(null, null, this.color, t, null);
    }
    rotateRight() {
      const t = this.copy(null, null, _LLRBNode.RED, this.left.right, null);
      return this.left.copy(null, null, this.color, null, t);
    }
    colorFlip() {
      const t = this.left.copy(null, null, !this.left.color, null, null), e = this.right.copy(null, null, !this.right.color, null, null);
      return this.copy(null, null, !this.color, t, e);
    }
    // For testing.
    checkMaxDepth() {
      const t = this.check();
      return Math.pow(2, t) <= this.size + 1;
    }
    // In a balanced RB tree, the black-depth (number of black nodes) from root to
    // leaves is equal on both sides.  This function verifies that or asserts.
    check() {
      if (this.isRed() && this.left.isRed()) throw fail();
      if (this.right.isRed()) throw fail();
      const t = this.left.check();
      if (t !== this.right.check()) throw fail();
      return t + (this.isRed() ? 0 : 1);
    }
  };
  LLRBNode.EMPTY = null, LLRBNode.RED = true, LLRBNode.BLACK = false;
  LLRBNode.EMPTY = new // Represents an empty node (a leaf node in the Red-Black Tree).
  class LLRBEmptyNode {
    constructor() {
      this.size = 0;
    }
    get key() {
      throw fail();
    }
    get value() {
      throw fail();
    }
    get color() {
      throw fail();
    }
    get left() {
      throw fail();
    }
    get right() {
      throw fail();
    }
    // Returns a copy of the current node.
    copy(t, e, r, n, i) {
      return this;
    }
    // Returns a copy of the tree, with the specified key/value added.
    insert(t, e, r) {
      return new LLRBNode(t, e);
    }
    // Returns a copy of the tree, with the specified key removed.
    remove(t, e) {
      return this;
    }
    isEmpty() {
      return true;
    }
    inorderTraversal(t) {
      return false;
    }
    reverseTraversal(t) {
      return false;
    }
    minKey() {
      return null;
    }
    maxKey() {
      return null;
    }
    isRed() {
      return false;
    }
    // For testing.
    checkMaxDepth() {
      return true;
    }
    check() {
      return 0;
    }
  }();
  var ObjectValue = class _ObjectValue {
    constructor(t) {
      this.value = t;
    }
    static empty() {
      return new _ObjectValue({
        mapValue: {}
      });
    }
    /**
     * Returns the value at the given path or null.
     *
     * @param path - the path to search
     * @returns The value at the path or null if the path is not set.
     */
    field(t) {
      if (t.isEmpty()) return this.value;
      {
        let e = this.value;
        for (let r = 0; r < t.length - 1; ++r) if (e = (e.mapValue.fields || {})[t.get(r)], !__PRIVATE_isMapValue(e)) return null;
        return e = (e.mapValue.fields || {})[t.lastSegment()], e || null;
      }
    }
    /**
     * Sets the field to the provided value.
     *
     * @param path - The field path to set.
     * @param value - The value to set.
     */
    set(t, e) {
      this.getFieldsMap(t.popLast())[t.lastSegment()] = __PRIVATE_deepClone(e);
    }
    /**
     * Sets the provided fields to the provided values.
     *
     * @param data - A map of fields to values (or null for deletes).
     */
    setAll(t) {
      let e = FieldPath$1.emptyPath(), r = {}, n = [];
      t.forEach((t2, i2) => {
        if (!e.isImmediateParentOf(i2)) {
          const t3 = this.getFieldsMap(e);
          this.applyChanges(t3, r, n), r = {}, n = [], e = i2.popLast();
        }
        t2 ? r[i2.lastSegment()] = __PRIVATE_deepClone(t2) : n.push(i2.lastSegment());
      });
      const i = this.getFieldsMap(e);
      this.applyChanges(i, r, n);
    }
    /**
     * Removes the field at the specified path. If there is no field at the
     * specified path, nothing is changed.
     *
     * @param path - The field path to remove.
     */
    delete(t) {
      const e = this.field(t.popLast());
      __PRIVATE_isMapValue(e) && e.mapValue.fields && delete e.mapValue.fields[t.lastSegment()];
    }
    isEqual(t) {
      return __PRIVATE_valueEquals(this.value, t.value);
    }
    /**
     * Returns the map that contains the leaf element of `path`. If the parent
     * entry does not yet exist, or if it is not a map, a new map will be created.
     */
    getFieldsMap(t) {
      let e = this.value;
      e.mapValue.fields || (e.mapValue = {
        fields: {}
      });
      for (let r = 0; r < t.length; ++r) {
        let n = e.mapValue.fields[t.get(r)];
        __PRIVATE_isMapValue(n) && n.mapValue.fields || (n = {
          mapValue: {
            fields: {}
          }
        }, e.mapValue.fields[t.get(r)] = n), e = n;
      }
      return e.mapValue.fields;
    }
    /**
     * Modifies `fieldsMap` by adding, replacing or deleting the specified
     * entries.
     */
    applyChanges(t, e, r) {
      forEach(e, (e2, r2) => t[e2] = r2);
      for (const e2 of r) delete t[e2];
    }
    clone() {
      return new _ObjectValue(__PRIVATE_deepClone(this.value));
    }
  };
  var MutableDocument = class _MutableDocument {
    constructor(t, e, r, n, i, s, o) {
      this.key = t, this.documentType = e, this.version = r, this.readTime = n, this.createTime = i, this.data = s, this.documentState = o;
    }
    /**
     * Creates a document with no known version or data, but which can serve as
     * base document for mutations.
     */
    static newInvalidDocument(t) {
      return new _MutableDocument(
        t,
        0,
        /* version */
        SnapshotVersion.min(),
        /* readTime */
        SnapshotVersion.min(),
        /* createTime */
        SnapshotVersion.min(),
        ObjectValue.empty(),
        0
        /* DocumentState.SYNCED */
      );
    }
    /**
     * Creates a new document that is known to exist with the given data at the
     * given version.
     */
    static newFoundDocument(t, e, r, n) {
      return new _MutableDocument(
        t,
        1,
        /* version */
        e,
        /* readTime */
        SnapshotVersion.min(),
        /* createTime */
        r,
        n,
        0
        /* DocumentState.SYNCED */
      );
    }
    /** Creates a new document that is known to not exist at the given version. */
    static newNoDocument(t, e) {
      return new _MutableDocument(
        t,
        2,
        /* version */
        e,
        /* readTime */
        SnapshotVersion.min(),
        /* createTime */
        SnapshotVersion.min(),
        ObjectValue.empty(),
        0
        /* DocumentState.SYNCED */
      );
    }
    /**
     * Creates a new document that is known to exist at the given version but
     * whose data is not known (e.g. a document that was updated without a known
     * base document).
     */
    static newUnknownDocument(t, e) {
      return new _MutableDocument(
        t,
        3,
        /* version */
        e,
        /* readTime */
        SnapshotVersion.min(),
        /* createTime */
        SnapshotVersion.min(),
        ObjectValue.empty(),
        2
        /* DocumentState.HAS_COMMITTED_MUTATIONS */
      );
    }
    /**
     * Changes the document type to indicate that it exists and that its version
     * and data are known.
     */
    convertToFoundDocument(t, e) {
      return !this.createTime.isEqual(SnapshotVersion.min()) || 2 !== this.documentType && 0 !== this.documentType || (this.createTime = t), this.version = t, this.documentType = 1, this.data = e, this.documentState = 0, this;
    }
    /**
     * Changes the document type to indicate that it doesn't exist at the given
     * version.
     */
    convertToNoDocument(t) {
      return this.version = t, this.documentType = 2, this.data = ObjectValue.empty(), this.documentState = 0, this;
    }
    /**
     * Changes the document type to indicate that it exists at a given version but
     * that its data is not known (e.g. a document that was updated without a known
     * base document).
     */
    convertToUnknownDocument(t) {
      return this.version = t, this.documentType = 3, this.data = ObjectValue.empty(), this.documentState = 2, this;
    }
    setHasCommittedMutations() {
      return this.documentState = 2, this;
    }
    setHasLocalMutations() {
      return this.documentState = 1, this.version = SnapshotVersion.min(), this;
    }
    setReadTime(t) {
      return this.readTime = t, this;
    }
    get hasLocalMutations() {
      return 1 === this.documentState;
    }
    get hasCommittedMutations() {
      return 2 === this.documentState;
    }
    get hasPendingWrites() {
      return this.hasLocalMutations || this.hasCommittedMutations;
    }
    isValidDocument() {
      return 0 !== this.documentType;
    }
    isFoundDocument() {
      return 1 === this.documentType;
    }
    isNoDocument() {
      return 2 === this.documentType;
    }
    isUnknownDocument() {
      return 3 === this.documentType;
    }
    isEqual(t) {
      return t instanceof _MutableDocument && this.key.isEqual(t.key) && this.version.isEqual(t.version) && this.documentType === t.documentType && this.documentState === t.documentState && this.data.isEqual(t.data);
    }
    mutableCopy() {
      return new _MutableDocument(this.key, this.documentType, this.version, this.readTime, this.createTime, this.data.clone(), this.documentState);
    }
    toString() {
      return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
    }
  };
  var __PRIVATE_QueryImpl = class {
    /**
     * Initializes a Query with a path and optional additional query constraints.
     * Path must currently be empty if this is a collection group query.
     */
    constructor(t, e = null, r = [], n = [], i = null, s = "F", o = null, a = null) {
      this.path = t, this.collectionGroup = e, this.explicitOrderBy = r, this.filters = n, this.limit = i, this.limitType = s, this.startAt = o, this.endAt = a, this.S = null, // The corresponding `Target` of this `Query` instance, for use with
      // non-aggregate queries.
      this.N = null, // The corresponding `Target` of this `Query` instance, for use with
      // aggregate queries. Unlike targets for non-aggregate queries,
      // aggregate query targets do not contain normalized order-bys, they only
      // contain explicit order-bys.
      this.O = null, this.startAt, this.endAt;
    }
  };
  var JsonProtoSerializer = class {
    constructor(t, e) {
      this.databaseId = t, this.useProto3Json = e;
    }
  };
  function __PRIVATE_fromVersion(t) {
    return __PRIVATE_hardAssert(!!t), SnapshotVersion.fromTimestamp(function fromTimestamp(t2) {
      const e = __PRIVATE_normalizeTimestamp(t2);
      return new Timestamp(e.seconds, e.nanos);
    }(t));
  }
  function __PRIVATE_toResourceName(t, e) {
    return __PRIVATE_toResourcePath(t, e).canonicalString();
  }
  function __PRIVATE_toResourcePath(t, e) {
    const r = function __PRIVATE_fullyQualifiedPrefixPath(t2) {
      return new ResourcePath(["projects", t2.projectId, "databases", t2.database]);
    }(t).child("documents");
    return void 0 === e ? r : r.child(e);
  }
  function __PRIVATE_toName(t, e) {
    return __PRIVATE_toResourceName(t.databaseId, e.path);
  }
  function fromName(t, e) {
    const r = function __PRIVATE_fromResourceName(t2) {
      const e2 = ResourcePath.fromString(t2);
      return __PRIVATE_hardAssert(__PRIVATE_isValidResourceName(e2)), e2;
    }(e);
    if (r.get(1) !== t.databaseId.projectId) throw new FirestoreError(T, "Tried to deserialize key from different project: " + r.get(1) + " vs " + t.databaseId.projectId);
    if (r.get(3) !== t.databaseId.database) throw new FirestoreError(T, "Tried to deserialize key from different database: " + r.get(3) + " vs " + t.databaseId.database);
    return new DocumentKey(function __PRIVATE_extractLocalPathFromResourceName(t2) {
      return __PRIVATE_hardAssert(t2.length > 4 && "documents" === t2.get(4)), t2.popFirst(5);
    }(r));
  }
  function __PRIVATE_fromBatchGetDocumentsResponse(t, e) {
    return "found" in e ? function __PRIVATE_fromFound(t2, e2) {
      __PRIVATE_hardAssert(!!e2.found), e2.found.name, e2.found.updateTime;
      const r = fromName(t2, e2.found.name), n = __PRIVATE_fromVersion(e2.found.updateTime), i = e2.found.createTime ? __PRIVATE_fromVersion(e2.found.createTime) : SnapshotVersion.min(), s = new ObjectValue({
        mapValue: {
          fields: e2.found.fields
        }
      });
      return MutableDocument.newFoundDocument(r, n, i, s);
    }(t, e) : "missing" in e ? function __PRIVATE_fromMissing(t2, e2) {
      __PRIVATE_hardAssert(!!e2.missing), __PRIVATE_hardAssert(!!e2.readTime);
      const r = fromName(t2, e2.missing), n = __PRIVATE_fromVersion(e2.readTime);
      return MutableDocument.newNoDocument(r, n);
    }(t, e) : fail();
  }
  function __PRIVATE_isValidResourceName(t) {
    return t.length >= 4 && "projects" === t.get(0) && "databases" === t.get(2);
  }
  function __PRIVATE_newSerializer(t) {
    return new JsonProtoSerializer(
      t,
      /* useProto3Json= */
      true
    );
  }
  var __PRIVATE_DatastoreImpl = class extends class Datastore {
  } {
    constructor(t, e, r, n) {
      super(), this.authCredentials = t, this.appCheckCredentials = e, this.connection = r, this.serializer = n, this.Y = false;
    }
    Z() {
      if (this.Y) throw new FirestoreError(w, "The client has already been terminated.");
    }
    /** Invokes the provided RPC with auth and AppCheck tokens. */
    P(t, e, r, n) {
      return this.Z(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then(([i, s]) => this.connection.P(t, __PRIVATE_toResourcePath(e, r), n, i, s)).catch((t2) => {
        throw "FirebaseError" === t2.name ? (t2.code === p && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), t2) : new FirestoreError(A, t2.toString());
      });
    }
    /** Invokes the provided RPC with streamed results with auth and AppCheck tokens. */
    g(t, e, r, n, i) {
      return this.Z(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then(([s, o]) => this.connection.g(t, __PRIVATE_toResourcePath(e, r), n, s, o, i)).catch((t2) => {
        throw "FirebaseError" === t2.name ? (t2.code === p && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), t2) : new FirestoreError(A, t2.toString());
      });
    }
    terminate() {
      this.Y = true, this.connection.terminate();
    }
  };
  async function __PRIVATE_invokeBatchGetDocumentsRpc(t, e) {
    const r = __PRIVATE_debugCast(t), n = {
      documents: e.map((t2) => __PRIVATE_toName(r.serializer, t2))
    }, i = await r.g("BatchGetDocuments", r.serializer.databaseId, ResourcePath.emptyPath(), n, e.length), s = /* @__PURE__ */ new Map();
    i.forEach((t2) => {
      const e2 = __PRIVATE_fromBatchGetDocumentsResponse(r.serializer, t2);
      s.set(e2.key.toString(), e2);
    });
    const o = [];
    return e.forEach((t2) => {
      const e2 = s.get(t2.toString());
      __PRIVATE_hardAssert(!!e2), o.push(e2);
    }), o;
  }
  var k = /* @__PURE__ */ new Map();
  function __PRIVATE_getDatastore(t) {
    if (t._terminated) throw new FirestoreError(w, "The client has already been terminated.");
    if (!k.has(t)) {
      __PRIVATE_logDebug("ComponentProvider", "Initializing Datastore");
      const e = function __PRIVATE_newConnection(t2) {
        return new __PRIVATE_FetchConnection(t2, fetch.bind(null));
      }(function __PRIVATE_makeDatabaseInfo(t2, e2, r2, n2) {
        return new DatabaseInfo(t2, e2, r2, n2.host, n2.ssl, n2.experimentalForceLongPolling, n2.experimentalAutoDetectLongPolling, __PRIVATE_cloneLongPollingOptions(n2.experimentalLongPollingOptions), n2.useFetchStreams);
      }(t._databaseId, t.app.options.appId || "", t._persistenceKey, t._freezeSettings())), r = __PRIVATE_newSerializer(t._databaseId), n = function __PRIVATE_newDatastore(t2, e2, r2, n2) {
        return new __PRIVATE_DatastoreImpl(t2, e2, r2, n2);
      }(t._authCredentials, t._appCheckCredentials, e, r);
      k.set(t, n);
    }
    return k.get(t);
  }
  var FirestoreSettingsImpl = class {
    constructor(t) {
      var e, r;
      if (void 0 === t.host) {
        if (void 0 !== t.ssl) throw new FirestoreError(T, "Can't provide ssl option if host option is not set");
        this.host = "firestore.googleapis.com", this.ssl = true;
      } else this.host = t.host, this.ssl = null === (e = t.ssl) || void 0 === e || e;
      if (this.credentials = t.credentials, this.ignoreUndefinedProperties = !!t.ignoreUndefinedProperties, this.localCache = t.localCache, void 0 === t.cacheSizeBytes) this.cacheSizeBytes = 41943040;
      else {
        if (-1 !== t.cacheSizeBytes && t.cacheSizeBytes < 1048576) throw new FirestoreError(T, "cacheSizeBytes must be at least 1048576");
        this.cacheSizeBytes = t.cacheSizeBytes;
      }
      !function __PRIVATE_validateIsNotUsedTogether(t2, e2, r2, n) {
        if (true === e2 && true === n) throw new FirestoreError(T, `${t2} and ${r2} cannot be used together.`);
      }("experimentalForceLongPolling", t.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", t.experimentalAutoDetectLongPolling), this.experimentalForceLongPolling = !!t.experimentalForceLongPolling, this.experimentalForceLongPolling ? this.experimentalAutoDetectLongPolling = false : void 0 === t.experimentalAutoDetectLongPolling ? this.experimentalAutoDetectLongPolling = true : (
        // For backwards compatibility, coerce the value to boolean even though
        // the TypeScript compiler has narrowed the type to boolean already.
        // noinspection PointlessBooleanExpressionJS
        this.experimentalAutoDetectLongPolling = !!t.experimentalAutoDetectLongPolling
      ), this.experimentalLongPollingOptions = __PRIVATE_cloneLongPollingOptions(null !== (r = t.experimentalLongPollingOptions) && void 0 !== r ? r : {}), function __PRIVATE_validateLongPollingOptions(t2) {
        if (void 0 !== t2.timeoutSeconds) {
          if (isNaN(t2.timeoutSeconds)) throw new FirestoreError(T, `invalid long polling timeout: ${t2.timeoutSeconds} (must not be NaN)`);
          if (t2.timeoutSeconds < 5) throw new FirestoreError(T, `invalid long polling timeout: ${t2.timeoutSeconds} (minimum allowed value is 5)`);
          if (t2.timeoutSeconds > 30) throw new FirestoreError(T, `invalid long polling timeout: ${t2.timeoutSeconds} (maximum allowed value is 30)`);
        }
      }(this.experimentalLongPollingOptions), this.useFetchStreams = !!t.useFetchStreams;
    }
    isEqual(t) {
      return this.host === t.host && this.ssl === t.ssl && this.credentials === t.credentials && this.cacheSizeBytes === t.cacheSizeBytes && this.experimentalForceLongPolling === t.experimentalForceLongPolling && this.experimentalAutoDetectLongPolling === t.experimentalAutoDetectLongPolling && function __PRIVATE_longPollingOptionsEqual(t2, e) {
        return t2.timeoutSeconds === e.timeoutSeconds;
      }(this.experimentalLongPollingOptions, t.experimentalLongPollingOptions) && this.ignoreUndefinedProperties === t.ignoreUndefinedProperties && this.useFetchStreams === t.useFetchStreams;
    }
  };
  var Firestore = class {
    /** @hideconstructor */
    constructor(t, e, r, n) {
      this._authCredentials = t, this._appCheckCredentials = e, this._databaseId = r, this._app = n, /**
       * Whether it's a Firestore or Firestore Lite instance.
       */
      this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new FirestoreSettingsImpl({}), this._settingsFrozen = false;
    }
    /**
     * The {@link @firebase/app#FirebaseApp} associated with this `Firestore` service
     * instance.
     */
    get app() {
      if (!this._app) throw new FirestoreError(w, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
      return this._app;
    }
    get _initialized() {
      return this._settingsFrozen;
    }
    get _terminated() {
      return void 0 !== this._terminateTask;
    }
    _setSettings(t) {
      if (this._settingsFrozen) throw new FirestoreError(w, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
      this._settings = new FirestoreSettingsImpl(t), void 0 !== t.credentials && (this._authCredentials = function __PRIVATE_makeAuthCredentialsProvider(t2) {
        if (!t2) return new __PRIVATE_EmptyAuthCredentialsProvider();
        switch (t2.type) {
          case "firstParty":
            return new __PRIVATE_FirstPartyAuthCredentialsProvider(t2.sessionIndex || "0", t2.iamToken || null, t2.authTokenFactory || null);
          case "provider":
            return t2.client;
          default:
            throw new FirestoreError(T, "makeAuthCredentialsProvider failed due to invalid credential type");
        }
      }(t.credentials));
    }
    _getSettings() {
      return this._settings;
    }
    _freezeSettings() {
      return this._settingsFrozen = true, this._settings;
    }
    _delete() {
      return this._terminateTask || (this._terminateTask = this._terminate()), this._terminateTask;
    }
    /** Returns a JSON-serializable representation of this `Firestore` instance. */
    toJSON() {
      return {
        app: this._app,
        databaseId: this._databaseId,
        settings: this._settings
      };
    }
    /**
     * Terminates all components used by this client. Subclasses can override
     * this method to clean up their own dependencies, but must also call this
     * method.
     *
     * Only ever called once.
     */
    _terminate() {
      return function __PRIVATE_removeComponents(t) {
        const e = k.get(t);
        e && (__PRIVATE_logDebug("ComponentProvider", "Removing Datastore"), k.delete(t), e.terminate());
      }(this), Promise.resolve();
    }
  };
  function getFirestore(e, r) {
    const n = "object" == typeof e ? e : getApp(), i = "string" == typeof e ? e : r || "(default)", s = _getProvider(n, "firestore/lite").getImmediate({
      identifier: i
    });
    if (!s._initialized) {
      const t = getDefaultEmulatorHostnameAndPort("firestore");
      t && connectFirestoreEmulator(s, ...t);
    }
    return s;
  }
  function connectFirestoreEmulator(t, e, r, n = {}) {
    var i;
    const s = (t = __PRIVATE_cast(t, Firestore))._getSettings(), o = `${e}:${r}`;
    if ("firestore.googleapis.com" !== s.host && s.host !== o && __PRIVATE_logWarn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."), t._setSettings(Object.assign(Object.assign({}, s), {
      host: o,
      ssl: false
    })), n.mockUserToken) {
      let e2, r2;
      if ("string" == typeof n.mockUserToken) e2 = n.mockUserToken, r2 = User.MOCK_USER;
      else {
        e2 = createMockUserToken(n.mockUserToken, null === (i = t._app) || void 0 === i ? void 0 : i.options.projectId);
        const s2 = n.mockUserToken.sub || n.mockUserToken.user_id;
        if (!s2) throw new FirestoreError(T, "mockUserToken must contain 'sub' or 'user_id' field!");
        r2 = new User(s2);
      }
      t._authCredentials = new __PRIVATE_EmulatorAuthCredentialsProvider(new __PRIVATE_OAuthToken(e2, r2));
    }
  }
  var Query = class _Query {
    // This is the lite version of the Query class in the main SDK.
    /** @hideconstructor protected */
    constructor(t, e, r) {
      this.converter = e, this._query = r, /** The type of this Firestore reference. */
      this.type = "query", this.firestore = t;
    }
    withConverter(t) {
      return new _Query(this.firestore, t, this._query);
    }
  };
  var DocumentReference = class _DocumentReference {
    /** @hideconstructor */
    constructor(t, e, r) {
      this.converter = e, this._key = r, /** The type of this Firestore reference. */
      this.type = "document", this.firestore = t;
    }
    get _path() {
      return this._key.path;
    }
    /**
     * The document's identifier within its collection.
     */
    get id() {
      return this._key.path.lastSegment();
    }
    /**
     * A string representing the path of the referenced document (relative
     * to the root of the database).
     */
    get path() {
      return this._key.path.canonicalString();
    }
    /**
     * The collection this `DocumentReference` belongs to.
     */
    get parent() {
      return new CollectionReference(this.firestore, this.converter, this._key.path.popLast());
    }
    withConverter(t) {
      return new _DocumentReference(this.firestore, t, this._key);
    }
  };
  var CollectionReference = class _CollectionReference extends Query {
    /** @hideconstructor */
    constructor(t, e, r) {
      super(t, e, function __PRIVATE_newQueryForPath(t2) {
        return new __PRIVATE_QueryImpl(t2);
      }(r)), this._path = r, /** The type of this Firestore reference. */
      this.type = "collection";
    }
    /** The collection's identifier. */
    get id() {
      return this._query.path.lastSegment();
    }
    /**
     * A string representing the path of the referenced collection (relative
     * to the root of the database).
     */
    get path() {
      return this._query.path.canonicalString();
    }
    /**
     * A reference to the containing `DocumentReference` if this is a
     * subcollection. If this isn't a subcollection, the reference is null.
     */
    get parent() {
      const t = this._path.popLast();
      return t.isEmpty() ? null : new DocumentReference(
        this.firestore,
        /* converter= */
        null,
        new DocumentKey(t)
      );
    }
    withConverter(t) {
      return new _CollectionReference(this.firestore, t, this._path);
    }
  };
  function doc(t, e, ...r) {
    if (t = getModularInstance(t), // We allow omission of 'pathString' but explicitly prohibit passing in both
    // 'undefined' and 'null'.
    1 === arguments.length && (e = __PRIVATE_AutoId.newId()), __PRIVATE_validateNonEmptyArgument("doc", "path", e), t instanceof Firestore) {
      const n = ResourcePath.fromString(e, ...r);
      return __PRIVATE_validateDocumentPath(n), new DocumentReference(
        t,
        /* converter= */
        null,
        new DocumentKey(n)
      );
    }
    {
      if (!(t instanceof DocumentReference || t instanceof CollectionReference)) throw new FirestoreError(T, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
      const n = t._path.child(ResourcePath.fromString(e, ...r));
      return __PRIVATE_validateDocumentPath(n), new DocumentReference(t.firestore, t instanceof CollectionReference ? t.converter : null, new DocumentKey(n));
    }
  }
  var Bytes = class _Bytes {
    /** @hideconstructor */
    constructor(t) {
      this._byteString = t;
    }
    /**
     * Creates a new `Bytes` object from the given Base64 string, converting it to
     * bytes.
     *
     * @param base64 - The Base64 string used to create the `Bytes` object.
     */
    static fromBase64String(t) {
      try {
        return new _Bytes(ByteString.fromBase64String(t));
      } catch (t2) {
        throw new FirestoreError(T, "Failed to construct data from Base64 string: " + t2);
      }
    }
    /**
     * Creates a new `Bytes` object from the given Uint8Array.
     *
     * @param array - The Uint8Array used to create the `Bytes` object.
     */
    static fromUint8Array(t) {
      return new _Bytes(ByteString.fromUint8Array(t));
    }
    /**
     * Returns the underlying bytes as a Base64-encoded string.
     *
     * @returns The Base64-encoded string created from the `Bytes` object.
     */
    toBase64() {
      return this._byteString.toBase64();
    }
    /**
     * Returns the underlying bytes in a new `Uint8Array`.
     *
     * @returns The Uint8Array created from the `Bytes` object.
     */
    toUint8Array() {
      return this._byteString.toUint8Array();
    }
    /**
     * Returns a string representation of the `Bytes` object.
     *
     * @returns A string representation of the `Bytes` object.
     */
    toString() {
      return "Bytes(base64: " + this.toBase64() + ")";
    }
    /**
     * Returns true if this `Bytes` object is equal to the provided one.
     *
     * @param other - The `Bytes` object to compare against.
     * @returns true if this `Bytes` object is equal to the provided one.
     */
    isEqual(t) {
      return this._byteString.isEqual(t._byteString);
    }
  };
  var FieldPath = class {
    /**
     * Creates a `FieldPath` from the provided field names. If more than one field
     * name is provided, the path will point to a nested field in a document.
     *
     * @param fieldNames - A list of field names.
     */
    constructor(...t) {
      for (let e = 0; e < t.length; ++e) if (0 === t[e].length) throw new FirestoreError(T, "Invalid field name at argument $(i + 1). Field names must not be empty.");
      this._internalPath = new FieldPath$1(t);
    }
    /**
     * Returns true if this `FieldPath` is equal to the provided one.
     *
     * @param other - The `FieldPath` to compare against.
     * @returns true if this `FieldPath` is equal to the provided one.
     */
    isEqual(t) {
      return this._internalPath.isEqual(t._internalPath);
    }
  };
  var GeoPoint = class {
    /**
     * Creates a new immutable `GeoPoint` object with the provided latitude and
     * longitude values.
     * @param latitude - The latitude as number between -90 and 90.
     * @param longitude - The longitude as number between -180 and 180.
     */
    constructor(t, e) {
      if (!isFinite(t) || t < -90 || t > 90) throw new FirestoreError(T, "Latitude must be a number between -90 and 90, but was: " + t);
      if (!isFinite(e) || e < -180 || e > 180) throw new FirestoreError(T, "Longitude must be a number between -180 and 180, but was: " + e);
      this._lat = t, this._long = e;
    }
    /**
     * The latitude of this `GeoPoint` instance.
     */
    get latitude() {
      return this._lat;
    }
    /**
     * The longitude of this `GeoPoint` instance.
     */
    get longitude() {
      return this._long;
    }
    /**
     * Returns true if this `GeoPoint` is equal to the provided one.
     *
     * @param other - The `GeoPoint` to compare against.
     * @returns true if this `GeoPoint` is equal to the provided one.
     */
    isEqual(t) {
      return this._lat === t._lat && this._long === t._long;
    }
    /** Returns a JSON-serializable representation of this GeoPoint. */
    toJSON() {
      return {
        latitude: this._lat,
        longitude: this._long
      };
    }
    /**
     * Actually private to JS consumers of our API, so this function is prefixed
     * with an underscore.
     */
    _compareTo(t) {
      return __PRIVATE_primitiveComparator(this._lat, t._lat) || __PRIVATE_primitiveComparator(this._long, t._long);
    }
  };
  var j = new RegExp("[~\\*/\\[\\]]");
  function __PRIVATE_fieldPathFromDotSeparatedString(t, e, r) {
    if (e.search(j) >= 0) throw __PRIVATE_createError(
      `Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,
      t,
      /* hasConverter= */
      false,
      /* path= */
      void 0,
      r
    );
    try {
      return new FieldPath(...e.split("."))._internalPath;
    } catch (n) {
      throw __PRIVATE_createError(
        `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,
        t,
        /* hasConverter= */
        false,
        /* path= */
        void 0,
        r
      );
    }
  }
  function __PRIVATE_createError(t, e, r, n, i) {
    const s = n && !n.isEmpty(), o = void 0 !== i;
    let a = `Function ${e}() called with invalid data`;
    r && (a += " (via `toFirestore()`)"), a += ". ";
    let u = "";
    return (s || o) && (u += " (found", s && (u += ` in field ${n}`), o && (u += ` in document ${i}`), u += ")"), new FirestoreError(T, a + t + u);
  }
  var DocumentSnapshot = class {
    // Note: This class is stripped down version of the DocumentSnapshot in
    // the legacy SDK. The changes are:
    // - No support for SnapshotMetadata.
    // - No support for SnapshotOptions.
    /** @hideconstructor protected */
    constructor(t, e, r, n, i) {
      this._firestore = t, this._userDataWriter = e, this._key = r, this._document = n, this._converter = i;
    }
    /** Property of the `DocumentSnapshot` that provides the document's ID. */
    get id() {
      return this._key.path.lastSegment();
    }
    /**
     * The `DocumentReference` for the document included in the `DocumentSnapshot`.
     */
    get ref() {
      return new DocumentReference(this._firestore, this._converter, this._key);
    }
    /**
     * Signals whether or not the document at the snapshot's location exists.
     *
     * @returns true if the document exists.
     */
    exists() {
      return null !== this._document;
    }
    /**
     * Retrieves all fields in the document as an `Object`. Returns `undefined` if
     * the document doesn't exist.
     *
     * @returns An `Object` containing all fields in the document or `undefined`
     * if the document doesn't exist.
     */
    data() {
      if (this._document) {
        if (this._converter) {
          const t = new QueryDocumentSnapshot(
            this._firestore,
            this._userDataWriter,
            this._key,
            this._document,
            /* converter= */
            null
          );
          return this._converter.fromFirestore(t);
        }
        return this._userDataWriter.convertValue(this._document.data.value);
      }
    }
    /**
     * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
     * document or field doesn't exist.
     *
     * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
     * field.
     * @returns The data at the specified field location or undefined if no such
     * field exists in the document.
     */
    // We are using `any` here to avoid an explicit cast by our users.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(t) {
      if (this._document) {
        const e = this._document.data.field(__PRIVATE_fieldPathFromArgument("DocumentSnapshot.get", t));
        if (null !== e) return this._userDataWriter.convertValue(e);
      }
    }
  };
  var QueryDocumentSnapshot = class extends DocumentSnapshot {
    /**
     * Retrieves all fields in the document as an `Object`.
     *
     * @override
     * @returns An `Object` containing all fields in the document.
     */
    data() {
      return super.data();
    }
  };
  function __PRIVATE_fieldPathFromArgument(t, e) {
    return "string" == typeof e ? __PRIVATE_fieldPathFromDotSeparatedString(t, e) : e instanceof FieldPath ? e._internalPath : e._delegate._internalPath;
  }
  var __PRIVATE_LiteUserDataWriter = class extends class AbstractUserDataWriter {
    convertValue(t, e = "none") {
      switch (__PRIVATE_typeOrder(t)) {
        case 0:
          return null;
        case 1:
          return t.booleanValue;
        case 2:
          return __PRIVATE_normalizeNumber(t.integerValue || t.doubleValue);
        case 3:
          return this.convertTimestamp(t.timestampValue);
        case 4:
          return this.convertServerTimestamp(t, e);
        case 5:
          return t.stringValue;
        case 6:
          return this.convertBytes(__PRIVATE_normalizeByteString(t.bytesValue));
        case 7:
          return this.convertReference(t.referenceValue);
        case 8:
          return this.convertGeoPoint(t.geoPointValue);
        case 9:
          return this.convertArray(t.arrayValue, e);
        case 10:
          return this.convertObject(t.mapValue, e);
        default:
          throw fail();
      }
    }
    convertObject(t, e) {
      return this.convertObjectMap(t.fields, e);
    }
    /**
     * @internal
     */
    convertObjectMap(t, e = "none") {
      const r = {};
      return forEach(t, (t2, n) => {
        r[t2] = this.convertValue(n, e);
      }), r;
    }
    convertGeoPoint(t) {
      return new GeoPoint(__PRIVATE_normalizeNumber(t.latitude), __PRIVATE_normalizeNumber(t.longitude));
    }
    convertArray(t, e) {
      return (t.values || []).map((t2) => this.convertValue(t2, e));
    }
    convertServerTimestamp(t, e) {
      switch (e) {
        case "previous":
          const r = __PRIVATE_getPreviousValue(t);
          return null == r ? null : this.convertValue(r, e);
        case "estimate":
          return this.convertTimestamp(__PRIVATE_getLocalWriteTime(t));
        default:
          return null;
      }
    }
    convertTimestamp(t) {
      const e = __PRIVATE_normalizeTimestamp(t);
      return new Timestamp(e.seconds, e.nanos);
    }
    convertDocumentKey(t, e) {
      const r = ResourcePath.fromString(t);
      __PRIVATE_hardAssert(__PRIVATE_isValidResourceName(r));
      const n = new DatabaseId(r.get(1), r.get(3)), i = new DocumentKey(r.popFirst(5));
      return n.isEqual(e) || // TODO(b/64130202): Somehow support foreign references.
      __PRIVATE_logError(`Document ${i} contains a document reference within a different database (${n.projectId}/${n.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`), i;
    }
  } {
    constructor(t) {
      super(), this.firestore = t;
    }
    convertBytes(t) {
      return new Bytes(t);
    }
    convertReference(t) {
      const e = this.convertDocumentKey(t, this.firestore._databaseId);
      return new DocumentReference(
        this.firestore,
        /* converter= */
        null,
        e
      );
    }
  };
  function getDoc(t) {
    const e = __PRIVATE_getDatastore((t = __PRIVATE_cast(t, DocumentReference)).firestore), r = new __PRIVATE_LiteUserDataWriter(t.firestore);
    return __PRIVATE_invokeBatchGetDocumentsRpc(e, [t._key]).then((e2) => {
      __PRIVATE_hardAssert(1 === e2.length);
      const n = e2[0];
      return new DocumentSnapshot(t.firestore, r, t._key, n.isFoundDocument() ? n : null, t.converter);
    });
  }
  !function __PRIVATE_registerFirestore() {
    !function __PRIVATE_setSDKVersion(t) {
      d = t;
    }(`${SDK_VERSION}_lite`), _registerComponent(new Component("firestore/lite", (t, { instanceIdentifier: e, options: r }) => {
      const n = t.getProvider("app").getImmediate(), i = new Firestore(new __PRIVATE_LiteAuthCredentialsProvider(t.getProvider("auth-internal")), new __PRIVATE_LiteAppCheckTokenProvider(t.getProvider("app-check-internal")), function __PRIVATE_databaseIdFromApp(t2, e2) {
        if (!Object.prototype.hasOwnProperty.apply(t2.options, ["projectId"])) throw new FirestoreError(T, '"projectId" not provided in firebase.initializeApp.');
        return new DatabaseId(t2.options.projectId, e2);
      }(n, e), n);
      return r && i._setSettings(r), i;
    }, "PUBLIC").setMultipleInstances(true)), // RUNTIME_ENV and BUILD_TARGET are replaced by real values during the compilation
    registerVersion("firestore-lite", "4.6.3", ""), registerVersion("firestore-lite", "4.6.3", "esm2017");
  }();

  // src/ai-reviews-db.js
  var firebaseConfig = {
    apiKey: "AIzaSyBfj1JWIPDwo4Fz7LKO1PhTKOIRI_MpzTs",
    authDomain: "shopify-reviews-422715.firebaseapp.com",
    projectId: "shopify-reviews-422715",
    storageBucket: "shopify-reviews-422715.appspot.com",
    messagingSenderId: "260432829218",
    appId: "1:260432829218:web:477853af8134c60439e37b"
  };
  var app = initializeApp(firebaseConfig);
  var firestore = getFirestore(app);
  async function reviews(storeId, productId) {
    try {
      if (!storeId || !productId) {
        return { error: "Faltan argumentos" };
      }
      const productRef = doc(firestore, `stores/${storeId}/products/${productId}`);
      const product = await getDoc(productRef);
      const reviews2 = product.data()?.reviews ?? [];
      const storeRef = doc(firestore, `stores/${storeId}`);
      const store = await getDoc(storeRef);
      const credits = store.data()?.credits ?? 0;
      return { active: true, exists: product.exists(), credits, reviews: reviews2 };
    } catch (error) {
      if (error.code == "permission-denied") {
        return { error: "La tienda no esta activa, verifica el pago" };
      } else {
        return { error: error.message ?? error.toString() };
      }
    }
  }
  window.firestore = { reviews };
})();
/*! For license information please see LICENCE.txt */
