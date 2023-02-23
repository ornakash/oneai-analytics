import React, { useEffect, useRef, useState } from 'react';
import { UploadParams } from '../common/types/componentsInputs';
import Papa from 'papaparse';
import SingleSelect from '../common/components/UploadCSVComponents/SingleSelect';
import {
  COLUMN_TYPES_OPTIONS,
  CUSTOM_VALUE_ID,
  IGNORE_ID,
} from '../common/components/UploadCSVComponents/constants';

const allowedExtensions = ['csv'];

const OneAiUpload = ({
  domain = 'https://api.oneai.com',
  apiKey = '',
  collection = '',
  darkMode = true,
}: UploadParams) => {
  const [data, setData] = useState([] as string[][]);
  const [error, setError] = useState(null as string | null);
  const [file, setFile] = useState(null as File | null);
  const [parseFinished, setParseFinished] = useState(false);
  const [columnsConfigurations, setColumnsConfigurations] = useState(
    [] as { id: string; customText?: string }[]
  );
  const [loading, setLoading] = useState(false);
  const [csvHasHeaders, setCsvHasHeaders] = useState(true);
  const currentParser = useRef(null as Papa.Parser | null);

  console.log('error', error, 'parseFinished', parseFinished);

  useEffect(() => {
    handleParse();
  }, [file]);

  const handleFileChange = (e: { target: { files: FileList | null } }) => {
    setError(null);
    setParseFinished(false);
    try {
      currentParser.current?.abort();
    } catch (e) {
      console.log(e);
    }

    const inputFile = e.target.files?.item(0);
    if (!inputFile) return;

    // Check if user has entered the file

    // Check the file extensions, if it not
    // included in the allowed extensions
    // we show the error
    const fileExtension = inputFile.type.split('/')[1];
    if (!allowedExtensions.includes(fileExtension)) {
      setError('Please input a csv file');
      return;
    }

    // If input type is correct set the state
    setFile(inputFile);
  };

  const handleParse = () => {
    // If user clicks the parse button without
    // a file we show a error
    if (!file) return setError('Enter a valid file');

    Papa.parse(file, {
      worker: true, // Don't bog down the main thread if its a big file
      step: function ({ data, errors }, parser) {
        if (errors.length > 0) {
          setError(errors[0].message);
          parser.abort();
          return;
        }

        currentParser.current = parser;
        setData((prev) => {
          if (prev.length === 0) {
            setColumnsConfigurations(
              (data as string[]).map(() => ({ id: IGNORE_ID }))
            );
          }

          return [...prev, data as string[]];
        });
      },
      complete: function (results, file) {
        console.log('parsing complete read', results, file);
        setParseFinished(true);
      },
    });
  };

  const handleUpload = async () => {
    console.log('uploading');
    if (!file) return;
    setLoading(true);
    const data = new FormData();
    data.append('file', file);

    await fetch(
      encodeURI(
        `${domain}/api/v0/pipeline/async/file?pipeline={"content_type": "text/csv", "steps":[{"skill":"clustering","params": {"collection": "${collection}"}}], "csv_params": {"columns": [${columnsConfigurations
          .map((cc) =>
            cc.id === IGNORE_ID
              ? false
              : '"' + (cc.id === CUSTOM_VALUE_ID ? cc.customText : cc.id) + '"'
          )
          .join(',')}]}}`
      ),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey ?? '',
        },
        body: data,
      }
    );

    setLoading(false);
  };

  return (
    <div
      className={`oneai-analytics-namespace h-full w-full ${
        darkMode ? 'dark' : ''
      }`}
    >
      <div className="h-full w-full overflow-hidden bg-[#272535] flex flex-col items-center text-white">
        {data.length > 0 ? (
          <div className="w-full h-full p-2">
            {loading ? (
              <>
                <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v1a7 7 0 00-7 7h1z"
                      ></path>
                    </svg>
                    <span className="text-white">Loading...</span>
                  </div>
                </div>
              </>
            ) : null}
            <div
              className={
                'h-full w-full flex flex-col relative ' +
                (loading ? 'pointer-events-none' : '')
              }
            >
              <div className="h-auto w-full">
                <span className="text-gray-200">
                  Select columns for upload to{' '}
                  <span className="text-white">' {collection} '</span>
                </span>
              </div>
              <div className="relative overflow-auto max-h-full block shadow-md sm:rounded-lg grow w-full">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase dark:text-gray-400 sticky top-0 backdrop-blur-[2px]">
                    <tr>
                      {data[0].map((header, i) => (
                        <th
                          key={`${header} - ${i}`}
                          scope="col"
                          className="px-2 py-3 w-max"
                        >
                          <div className="w-full flex flex-col items-center">
                            <div className="w-max mb-2">
                              <SingleSelect
                                options={COLUMN_TYPES_OPTIONS}
                                selectedLabelId={
                                  columnsConfigurations[i].id ?? null
                                }
                                onSelect={(selectedLabelId) => {
                                  setColumnsConfigurations((prev) => {
                                    const newColumnsConfigurations = [...prev];
                                    newColumnsConfigurations[i] = {
                                      id: selectedLabelId,
                                    };
                                    return newColumnsConfigurations;
                                  });
                                }}
                              />
                              {columnsConfigurations[i].id ===
                              CUSTOM_VALUE_ID ? (
                                <input
                                  type="text"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                  onChange={(e) =>
                                    setColumnsConfigurations((prev) => {
                                      const newColumnsConfigurations = [
                                        ...prev,
                                      ];
                                      newColumnsConfigurations[i].customText =
                                        e.target.value;

                                      return newColumnsConfigurations;
                                    })
                                  }
                                />
                              ) : null}
                            </div>
                            <span className="w-max">
                              {csvHasHeaders ? header : `Column ${i + 1}`}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="h-96 overflow-y-auto">
                    {data.slice(csvHasHeaders ? 1 : 0).map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-200 dark:border-gray-700"
                      >
                        {row.map((cell, i) => (
                          <td
                            key={i}
                            className="px-6 py-4 max-w-[200px] truncate"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="absolute bottom-0 w-full">
                <div className="flex justify-between mb-2 p-2 backdrop-blur-[2px]">
                  <div>
                    <div className="flex items-center mr-4">
                      <input
                        checked={csvHasHeaders}
                        onChange={(e) => setCsvHasHeaders(e.target.checked)}
                        id="checkbox"
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="checkbox"
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        CSV has headers
                      </label>
                    </div>
                  </div>
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setError(null);
                        setData([]);
                        setParseFinished(false);
                      }}
                      className="text-gray-400 font-medium px-5 text-center hover:text-gray-300 mr-12"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpload()}
                      className="text-white bg-indigo-500 hover:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-300 font-medium rounded-sm text-sm px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800"
                    >
                      Upload {data.length} items
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <span className="mt-36">
              Your collection is empty, add items to populate it
            </span>
            <div className="mt-4 w-96">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      aria-hidden="true"
                      className="w-10 h-10 mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      ></path>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload CSV</span>{' '}
                      or drag and drop
                    </p>
                    <ul className="w-full flex-wrap list-disc">
                      <li className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Up to 255 characters per cell
                      </li>
                      <li className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Up to 1GB
                      </li>
                      <li className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Up to 250 columns
                      </li>
                    </ul>
                  </div>
                  <input
                    onChange={handleFileChange}
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OneAiUpload;
export { OneAiUpload };
