import React from "react";
import { useState, useEffect } from "react";
import { render } from "react-dom";

const App = () => (
  <div style={{ width: "100%" }}>
    <div>
      How is react? <TextInput />
    </div>
    <div>(Hint: React is pretty awsome, could say react rocks.)</div>
  </div>
);

function useChangeHandler(initialValue) {
  const [state, setState] = useState(initialValue);
  const [verificationState, setVerificationState] = useState(null);

  useEffect(() => {
    console.log(
      `useServiceVerification. Create new ServerRequest for '${state}'`
    );

    // remove old state
    setVerificationState(null);

    const request = new ServerRequest(state);
    request.verifyValue().then(response =>
      setVerificationState({
        message: response,
        requestId: request.requestId
      })
    );

    //
    return function() {
      console.log("useEffect CANCEL REQUEST " + request.requestId);
      request.cancel();
    };
  }, [state]);

  return [state, e => setState(e.target.value), verificationState];
}

let requestDebugCounter = 0;
/**
 *  Represents a running server validation request.
 * could be modeled without class, but too lazy today 😴
 */
class ServerRequest {
  constructor(value) {
    this.requestId = `ServerRequest#${++requestDebugCounter}_for_value_'${value}'`;

    this.canceled = false;
    this.value = value;
  }

  verifyValue() {
    // simulate real server access
    return new Promise(resolve =>
      window.setTimeout(() => {
        // Response from server received!

        if (this.canceled) {
          // we're canceled... discard everything
          console.log(
            `[${this.requestId}] received Response for out-of-date value '${
              this.value
            }' but has been canceled. Discarding`
          );

          return;
        }
        console.log(
          `[${this.requestId}] received Response for up-to-date value '${
            this.value
          }'.`
        );
        resolve(this.value === "react rocks" ? "YES!" : "NO. TRY AGAIN.");
      }, 1500)
    );
  }

  cancel() {
    console.log(`[${this.requestId}] canceling request`);
    this.canceled = true;
  }
}

function TextInput() {
  const [state, setState, verificationState] = useChangeHandler("");

  return (
    <>
      <input value={state} onChange={e => setState(e)} />
      {verificationState && (
        <div>
          Server returned: <b>{verificationState.message}</b> (response coming
          from server request <code>{verificationState.requestId}</code>)
        </div>
      )}
    </>
  );
}

render(<App />, document.getElementById("root"));
